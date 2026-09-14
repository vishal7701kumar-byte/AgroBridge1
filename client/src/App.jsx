import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoleSelectionPage from './components/RoleSelectionPage';
import RoleLoginPage from './components/RoleLoginPage';
import RoleRegisterPage from './components/RoleRegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import BulkBuyerDashboard from './pages/BulkBuyerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PriceComparisonPage from './pages/PriceComparisonPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderFeedbackPage from './pages/OrderFeedbackPage';
import ConsumerSupportPage from './pages/ConsumerSupportPage';
import LandingPage from './pages/LandingPage';
import { Key, X, Check, ArrowRight } from 'lucide-react';

const ROLE_CONFIGS = {
  FARMER: {
    roleKey: 'FARMER',
    pageTitle: 'Farmer Login',
    subtitle: 'Manage your farm and sell directly to buyers.',
    buttonText: 'Login as Farmer',
    loginRoute: '/farmer/login',
    registerRoute: '/farmer/register',
    dashboardRoute: '/farmer/dashboard',
    emoji: '👨‍🌾',
    demoEmail: 'farmer@agrobridge.demo',
    ambientGlow: 'bg-emerald-600/15',
    cardBg: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
    cardBorder: 'border-emerald-500/40',
    iconBox: 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white',
    focusBorder: 'focus:border-emerald-500',
    btnGradient: 'from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 shadow-emerald-500/20 hover:brightness-110',
    badgeTheme: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    textAccent: 'text-emerald-400'
  },
  CONSUMER: {
    roleKey: 'CONSUMER',
    pageTitle: 'Consumer Login',
    subtitle: 'Buy fresh products directly from farmers.',
    buttonText: 'Login as Consumer',
    loginRoute: '/consumer/login',
    registerRoute: '/consumer/register',
    dashboardRoute: '/consumer/dashboard',
    emoji: '🛒',
    demoEmail: 'consumer@agrobridge.demo',
    ambientGlow: 'bg-teal-600/15',
    cardBg: 'from-teal-950/40 via-slate-900/90 to-slate-950',
    cardBorder: 'border-teal-500/40',
    iconBox: 'bg-gradient-to-tr from-teal-600 to-cyan-400 text-white',
    focusBorder: 'focus:border-teal-500',
    btnGradient: 'from-teal-500 via-cyan-500 to-teal-400 text-slate-950 shadow-teal-500/20 hover:brightness-110',
    badgeTheme: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    textAccent: 'text-teal-400'
  },
  BULK_BUYER: {
    roleKey: 'BULK_BUYER',
    pageTitle: 'Bulk Buyer Login',
    subtitle: 'Buy agricultural products in bulk for your business.',
    buttonText: 'Login as Bulk Buyer',
    loginRoute: '/bulk-buyer/login',
    registerRoute: '/bulk-buyer/register',
    dashboardRoute: '/bulk-buyer/dashboard',
    emoji: '🏢',
    demoEmail: 'bulkbuyer@agrobridge.demo',
    ambientGlow: 'bg-indigo-600/15',
    cardBg: 'from-indigo-950/40 via-slate-900/90 to-slate-950',
    cardBorder: 'border-indigo-500/40',
    iconBox: 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white',
    focusBorder: 'focus:border-indigo-500',
    btnGradient: 'from-indigo-600 via-blue-600 to-indigo-500 text-white shadow-indigo-600/20 hover:brightness-110',
    badgeTheme: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    textAccent: 'text-indigo-400'
  },
  DRIVER: {
    roleKey: 'DRIVER',
    pageTitle: 'Driver Login',
    subtitle: 'Deliver fresh products and earn with AgroBridge.',
    buttonText: 'Login as Driver',
    loginRoute: '/driver/login',
    registerRoute: '/driver/register',
    dashboardRoute: '/driver/dashboard',
    emoji: '🚚',
    demoEmail: 'driver@agrobridge.demo',
    ambientGlow: 'bg-amber-600/15',
    cardBg: 'from-amber-950/40 via-slate-900/90 to-slate-950',
    cardBorder: 'border-amber-500/40',
    iconBox: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-slate-950',
    focusBorder: 'focus:border-amber-500',
    btnGradient: 'from-amber-500 via-orange-500 to-amber-400 text-slate-950 shadow-amber-500/20 hover:brightness-110',
    badgeTheme: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    textAccent: 'text-amber-400'
  },
  ADMIN: {
    roleKey: 'ADMIN',
    pageTitle: 'Admin Login',
    subtitle: 'Secure access to the AgroBridge administration panel.',
    buttonText: 'Login as Admin',
    loginRoute: '/admin/login',
    dashboardRoute: '/admin/dashboard',
    emoji: '👨‍💼',
    demoEmail: 'admin@agrobridge.demo',
    emailLabel: 'Admin Email',
    ambientGlow: 'bg-violet-600/15',
    cardBg: 'from-violet-950/40 via-slate-900/90 to-slate-950',
    cardBorder: 'border-violet-500/40',
    iconBox: 'bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white',
    focusBorder: 'focus:border-violet-500',
    btnGradient: 'from-violet-600 via-fuchsia-600 to-violet-500 text-white shadow-violet-600/20 hover:brightness-110',
    badgeTheme: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
    textAccent: 'text-violet-400'
  }
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname || '/');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agrobridge_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Synchronize browser history
  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (user, redirectUrl) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}! Logged in as ${user.role}.`);
    navigate(redirectUrl || `/${user.role.toLowerCase().replace('_', '-')}/dashboard`);
  };

  const handleLogout = () => {
    localStorage.removeItem('agrobridge_token');
    localStorage.removeItem('agrobridge_user');
    setCurrentUser(null);
    showToast('You have been safely logged out.');
    navigate('/login');
  };

  // ROLE-BASED ROUTE GUARD
  // If user tries to access a protected dashboard without proper authorization
  const renderView = () => {
    // Public Front Landing Page: /
    if (currentRoute === '/' || currentRoute === '') {
      return <LandingPage onNavigate={navigate} currentUser={currentUser} />;
    }

    // Live Order Tracking Route: /consumer/orders/:id/track or /orders/:id/track
    if (currentRoute.includes('/orders/') && currentRoute.includes('/track')) {
      return <OrderTrackingPage currentRoute={currentRoute} onNavigate={navigate} />;
    }

    // Consumer Feedback Route: /consumer/orders/:id/feedback or /orders/:id/feedback
    if (currentRoute.includes('/orders/') && currentRoute.includes('/feedback') && !currentRoute.startsWith('/bulk-buyer/')) {
      return <OrderFeedbackPage currentRoute={currentRoute} onNavigate={navigate} currentUser={currentUser} />;
    }

    // Consumer Dispute & Support Center Route: /consumer/support or /support
    if (currentRoute === '/consumer/support' || currentRoute === '/support') {
      return <ConsumerSupportPage onNavigate={navigate} currentUser={currentUser} />;
    }

    // Quick-commerce Multi-step Checkout: /consumer/checkout or /checkout
    if (currentRoute === '/consumer/checkout' || currentRoute === '/checkout') {
      return <CheckoutPage onNavigate={navigate} currentUser={currentUser} />;
    }

    // Dedicated Price Comparison Route: /consumer/product/:id/compare-price or /product/:id/compare-price
    if (currentRoute.includes('/compare-price')) {
      return <PriceComparisonPage currentRoute={currentRoute} onNavigate={navigate} />;
    }

    // Product Details Route: /consumer/product/:id or /product/:id
    if (currentRoute.includes('/product/') && !currentRoute.startsWith('/bulk-buyer/')) {
      return <ProductDetailsPage currentRoute={currentRoute} onNavigate={navigate} />;
    }

    const isBulkBuyerRoute = currentRoute.startsWith('/bulk-buyer/') && !currentRoute.includes('/login') && !currentRoute.includes('/register');
    const isAdminRoute = (currentRoute.startsWith('/admin/') || currentRoute === '/admin') && !currentRoute.includes('/login');
    const isDashboard = currentRoute.includes('/dashboard') || isBulkBuyerRoute || isAdminRoute;

    if (isDashboard) {
      if (!currentUser) {
        // Redirect unauthorized guest to role-specific or main login
        if (currentRoute.includes('/farmer/')) return <RoleLoginPage roleConfig={ROLE_CONFIGS.FARMER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
        if (currentRoute.includes('/consumer/')) return <RoleLoginPage roleConfig={ROLE_CONFIGS.CONSUMER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
        if (currentRoute.includes('/bulk-buyer/')) return <RoleLoginPage roleConfig={ROLE_CONFIGS.BULK_BUYER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
        if (currentRoute.includes('/driver/')) return <RoleLoginPage roleConfig={ROLE_CONFIGS.DRIVER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
        if (currentRoute.includes('/admin/')) return <RoleLoginPage roleConfig={ROLE_CONFIGS.ADMIN} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
        return <RoleSelectionPage onNavigate={navigate} />;
      }

      // Check role authorization
      if (currentRoute.startsWith('/farmer/') && currentUser.role !== 'FARMER') {
        return (
          <UnauthorizedAccessCard
            requiredRole="Farmer"
            userRole={currentUser.role}
            correctLoginRoute="/farmer/login"
            onNavigate={navigate}
          />
        );
      }
      if (currentRoute.startsWith('/consumer/') && currentUser.role !== 'CONSUMER') {
        return (
          <UnauthorizedAccessCard
            requiredRole="Consumer"
            userRole={currentUser.role}
            correctLoginRoute="/consumer/login"
            onNavigate={navigate}
          />
        );
      }
      if (currentRoute.startsWith('/bulk-buyer/') && currentUser.role !== 'BULK_BUYER') {
        return (
          <UnauthorizedAccessCard
            requiredRole="Bulk Buyer"
            userRole={currentUser.role}
            correctLoginRoute="/bulk-buyer/login"
            onNavigate={navigate}
          />
        );
      }
      if (currentRoute.startsWith('/driver/') && currentUser.role !== 'DRIVER') {
        return (
          <UnauthorizedAccessCard
            requiredRole="Driver"
            userRole={currentUser.role}
            correctLoginRoute="/driver/login"
            onNavigate={navigate}
          />
        );
      }
      if ((currentRoute.startsWith('/admin/') || currentRoute === '/admin') && currentUser.role !== 'ADMIN') {
        return (
          <UnauthorizedAccessCard
            requiredRole="Admin"
            userRole={currentUser.role}
            correctLoginRoute="/admin/login"
            onNavigate={navigate}
          />
        );
      }

      // Render authorized dashboard
      switch (currentUser.role) {
        case 'FARMER':
          return <FarmerDashboard currentUser={currentUser} onLogout={handleLogout} />;
        case 'CONSUMER':
          return <ConsumerDashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={navigate} />;
        case 'BULK_BUYER':
          return <BulkBuyerDashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={navigate} initialRoute={currentRoute} />;
        case 'DRIVER':
          return <DriverDashboard currentUser={currentUser} onLogout={handleLogout} />;
        case 'ADMIN':
          return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={navigate} initialRoute={currentRoute} />;
        default:
          return <RoleSelectionPage onNavigate={navigate} />;
      }
    }

    // Role-specific login routes
    if (currentRoute === '/farmer/login') {
      return <RoleLoginPage roleConfig={ROLE_CONFIGS.FARMER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/consumer/login') {
      return <RoleLoginPage roleConfig={ROLE_CONFIGS.CONSUMER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/bulk-buyer/login') {
      return <RoleLoginPage roleConfig={ROLE_CONFIGS.BULK_BUYER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/driver/login') {
      return <RoleLoginPage roleConfig={ROLE_CONFIGS.DRIVER} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/admin/login') {
      return <RoleLoginPage roleConfig={ROLE_CONFIGS.ADMIN} onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
    }

    // Role-specific registration routes
    if (currentRoute === '/farmer/register') {
      return <RoleRegisterPage roleConfig={ROLE_CONFIGS.FARMER} onNavigate={navigate} onRegisterSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/consumer/register') {
      return <RoleRegisterPage roleConfig={ROLE_CONFIGS.CONSUMER} onNavigate={navigate} onRegisterSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/bulk-buyer/register') {
      return <RoleRegisterPage roleConfig={ROLE_CONFIGS.BULK_BUYER} onNavigate={navigate} onRegisterSuccess={handleLoginSuccess} />;
    }
    if (currentRoute === '/driver/register') {
      return <RoleRegisterPage roleConfig={ROLE_CONFIGS.DRIVER} onNavigate={navigate} onRegisterSuccess={handleLoginSuccess} />;
    }

    // Default: Role Selection Page
    return <RoleSelectionPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 bg-grid-pattern selection:bg-emerald-500 selection:text-white">
      
      {/* Toast alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border ${
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-600 text-rose-100' : 'bg-emerald-950/90 border-emerald-600 text-emerald-100'
        } backdrop-blur-md animate-fadeIn`}>
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar (rendered on all pages except Landing Page) */}
      {currentRoute !== '/' && (
        <Navbar
          currentUser={currentUser}
          activeRoute={currentRoute}
          onNavigate={navigate}
          onLogout={handleLogout}
          onShowDemoGuide={() => setShowDemoModal(true)}
        />
      )}

      {/* Main Routed Page */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Demo Credentials Guide Modal */}
      {showDemoModal && (
        <DemoCredentialsModal
          onClose={() => setShowDemoModal(false)}
          onSelectRole={(route) => {
            setShowDemoModal(false);
            navigate(route);
          }}
        />
      )}

      {/* Platform Footer (rendered on all pages except Landing Page) */}
      {currentRoute !== '/' && (
        <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>🌱 <span className="text-slate-300 font-bold">AgroBridge</span> — Role-Based Agricultural Disintermediation & Logistics</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>5 Isolated Roles</span>
              <span>•</span>
              <span>Bcrypt Hashing</span>
              <span>•</span>
              <span>JWT Role Authorization</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}

// Sub-component for displaying unauthorized access alert
function UnauthorizedAccessCard({ requiredRole, userRole, correctLoginRoute, onNavigate }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-rose-600/60 rounded-3xl p-8 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-3xl">
          🚫
        </div>
        <h2 className="text-2xl font-bold text-white">Restricted Area</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          This dashboard requires <span className="text-white font-bold">{requiredRole}</span> privileges. You are currently logged in as a <span className="text-rose-400 font-bold">{userRole}</span>.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => onNavigate(correctLoginRoute)}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            Go to {requiredRole} Login Page
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for viewing 5 demo accounts
function DemoCredentialsModal({ onClose, onSelectRole }) {
  const accounts = [
    { role: 'FARMER', email: 'farmer@agrobridge.demo', pass: 'Demo@123', emoji: '👨‍🌾', route: '/farmer/login', color: 'emerald' },
    { role: 'CONSUMER', email: 'consumer@agrobridge.demo', pass: 'Demo@123', emoji: '🛒', route: '/consumer/login', color: 'teal' },
    { role: 'BULK BUYER', email: 'bulkbuyer@agrobridge.demo', pass: 'Demo@123', emoji: '🏢', route: '/bulk-buyer/login', color: 'indigo' },
    { role: 'DRIVER', email: 'driver@agrobridge.demo', pass: 'Demo@123', emoji: '🚚', route: '/driver/login', color: 'amber' },
    { role: 'ADMIN', email: 'admin@agrobridge.demo', pass: 'Demo@123', emoji: '👨‍💼', route: '/admin/login', color: 'violet' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pre-Configured Demo Accounts</h3>
            <p className="text-xs text-slate-400">All passwords: <span className="font-mono text-amber-400 font-bold">Demo@123</span></p>
          </div>
        </div>

        <div className="space-y-2.5">
          {accounts.map((acc) => (
            <div
              key={acc.role}
              onClick={() => onSelectRole(acc.route)}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{acc.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{acc.role}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">{acc.email}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">Password: Demo@123</div>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white flex items-center gap-1">
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-center">
          💡 Tip: You can test the cross-role rejection by trying to log into the Consumer portal with Farmer credentials!
        </div>
      </div>
    </div>
  );
}
