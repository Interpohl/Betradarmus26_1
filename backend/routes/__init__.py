"""
Routes Package - Modular API route handlers
"""
from .auth import router as auth_router
from .admin import router as admin_router
from .billing import router as billing_router
from .signals import router as signals_router
from .statistics import router as statistics_router
from .live_data import router as live_data_router

__all__ = [
    'auth_router',
    'admin_router', 
    'billing_router',
    'signals_router',
    'statistics_router',
    'live_data_router'
]
