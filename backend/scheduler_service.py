"""
Scheduler Service - Automated background tasks for BETRADARMUS
Handles daily result updates, statistics processing, and cleanup tasks
"""
import asyncio
import logging
from datetime import datetime, timezone, time, timedelta
from typing import Optional, Callable, Dict, Any
import os

logger = logging.getLogger(__name__)

class SchedulerService:
    """
    Lightweight scheduler for background tasks
    Runs tasks at specified intervals without external dependencies
    """
    
    def __init__(self, db):
        self.db = db
        self.running = False
        self.tasks: Dict[str, dict] = {}
        self._task_handle: Optional[asyncio.Task] = None
        
    def register_task(
        self, 
        name: str, 
        func: Callable, 
        interval_hours: int = 24,
        run_at_hour: Optional[int] = None,  # Run at specific hour (0-23)
        enabled: bool = True
    ):
        """Register a scheduled task"""
        self.tasks[name] = {
            "func": func,
            "interval_hours": interval_hours,
            "run_at_hour": run_at_hour,
            "enabled": enabled,
            "last_run": None,
            "next_run": None,
            "run_count": 0,
            "last_error": None
        }
        logger.info(f"Registered scheduled task: {name} (every {interval_hours}h)")
    
    def _calculate_next_run(self, task: dict) -> datetime:
        """Calculate next run time for a task"""
        now = datetime.now(timezone.utc)
        
        if task["run_at_hour"] is not None:
            # Run at specific hour
            target = now.replace(
                hour=task["run_at_hour"], 
                minute=0, 
                second=0, 
                microsecond=0
            )
            if target <= now:
                target += timedelta(days=1)
            return target
        else:
            # Run at interval
            if task["last_run"]:
                return task["last_run"] + timedelta(hours=task["interval_hours"])
            return now + timedelta(minutes=5)  # First run in 5 minutes
    
    async def _run_task(self, name: str, task: dict):
        """Execute a single task"""
        try:
            logger.info(f"Running scheduled task: {name}")
            start_time = datetime.now(timezone.utc)
            
            result = await task["func"]()
            
            task["last_run"] = datetime.now(timezone.utc)
            task["next_run"] = self._calculate_next_run(task)
            task["run_count"] += 1
            task["last_error"] = None
            
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.info(f"Task {name} completed in {duration:.2f}s: {result}")
            
            # Log to database
            await self.db.scheduler_logs.insert_one({
                "task_name": name,
                "status": "success",
                "result": str(result) if result else None,
                "duration_seconds": duration,
                "timestamp": datetime.now(timezone.utc)
            })
            
            return result
            
        except Exception as e:
            task["last_error"] = str(e)
            task["next_run"] = self._calculate_next_run(task)
            logger.error(f"Task {name} failed: {e}")
            
            # Log error to database
            await self.db.scheduler_logs.insert_one({
                "task_name": name,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc)
            })
            
            return None
    
    async def _scheduler_loop(self):
        """Main scheduler loop"""
        logger.info("Scheduler loop started")
        
        while self.running:
            now = datetime.now(timezone.utc)
            
            for name, task in self.tasks.items():
                if not task["enabled"]:
                    continue
                
                # Calculate next run if not set
                if task["next_run"] is None:
                    task["next_run"] = self._calculate_next_run(task)
                
                # Check if task should run
                if now >= task["next_run"]:
                    asyncio.create_task(self._run_task(name, task))
            
            # Sleep for 60 seconds before checking again
            await asyncio.sleep(60)
    
    def start(self):
        """Start the scheduler"""
        if self.running:
            logger.warning("Scheduler already running")
            return
        
        self.running = True
        self._task_handle = asyncio.create_task(self._scheduler_loop())
        logger.info("Scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        if self._task_handle:
            self._task_handle.cancel()
        logger.info("Scheduler stopped")
    
    def get_status(self) -> dict:
        """Get scheduler status"""
        return {
            "running": self.running,
            "tasks": {
                name: {
                    "enabled": task["enabled"],
                    "last_run": task["last_run"].isoformat() if task["last_run"] else None,
                    "next_run": task["next_run"].isoformat() if task["next_run"] else None,
                    "run_count": task["run_count"],
                    "last_error": task["last_error"]
                }
                for name, task in self.tasks.items()
            }
        }
    
    async def run_task_now(self, name: str) -> dict:
        """Manually trigger a task"""
        if name not in self.tasks:
            return {"success": False, "error": "Task nicht gefunden"}
        
        task = self.tasks[name]
        result = await self._run_task(name, task)
        
        return {
            "success": True,
            "task": name,
            "result": result
        }


# Global scheduler instance
_scheduler: Optional[SchedulerService] = None

def get_scheduler() -> Optional[SchedulerService]:
    """Get the global scheduler instance"""
    return _scheduler

def init_scheduler(db) -> SchedulerService:
    """Initialize the global scheduler"""
    global _scheduler
    _scheduler = SchedulerService(db)
    return _scheduler


# ==================== SCHEDULED TASKS ====================

async def create_daily_result_update_task(db, statistics_service):
    """
    Task: Update tip results daily at 6:00 UTC
    Fetches match results from Football-Data.org and evaluates pending tips
    """
    async def task():
        try:
            result = await statistics_service.process_pending_tips()
            return {
                "processed": result.get("processed", 0),
                "wins": result.get("wins", 0),
                "losses": result.get("losses", 0)
            }
        except Exception as e:
            logger.error(f"Daily result update failed: {e}")
            raise
    
    return task


async def create_statistics_refresh_task(db):
    """
    Task: Refresh cached statistics every 4 hours
    """
    async def task():
        try:
            # Aggregate subscription stats
            pipeline = [
                {"$group": {
                    "_id": "$subscription",
                    "count": {"$sum": 1}
                }}
            ]
            stats = await db.users.aggregate(pipeline).to_list(10)
            
            # Calculate totals
            total_users = sum(s["count"] for s in stats)
            subscription_breakdown = {s["_id"]: s["count"] for s in stats}
            
            # Cache the stats
            await db.cached_stats.update_one(
                {"type": "subscription_stats"},
                {
                    "$set": {
                        "total_users": total_users,
                        "breakdown": subscription_breakdown,
                        "updated_at": datetime.now(timezone.utc)
                    }
                },
                upsert=True
            )
            
            return {"total_users": total_users, "breakdown": subscription_breakdown}
            
        except Exception as e:
            logger.error(f"Statistics refresh failed: {e}")
            raise
    
    return task


async def create_cleanup_task(db):
    """
    Task: Clean up old data (logs, sessions) daily at 3:00 UTC
    """
    async def task():
        try:
            thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
            
            # Clean old scheduler logs
            result = await db.scheduler_logs.delete_many({
                "timestamp": {"$lt": thirty_days_ago}
            })
            deleted_logs = result.deleted_count
            
            # Clean old sessions (if any)
            result = await db.sessions.delete_many({
                "expires_at": {"$lt": datetime.now(timezone.utc)}
            })
            deleted_sessions = result.deleted_count
            
            return {
                "deleted_logs": deleted_logs,
                "deleted_sessions": deleted_sessions
            }
            
        except Exception as e:
            logger.error(f"Cleanup task failed: {e}")
            raise
    
    return task
