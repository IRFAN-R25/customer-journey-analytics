import React, { useEffect, useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowDown,
  Clock,
  Layers,
  Search,
  Eye,
  ShoppingBag,
  CreditCard,
  User,
  Filter,
  Shield,
  Star,
  Heart,
  LogIn,
  UserPlus,
  LogOut,
  Trash2,
  Sparkles,
  Home,
  Check,
  Copy,
  Code2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShoppingBasket
} from 'lucide-react';
import { api } from '../../services/api';
import { CustomerJourney, JourneyStep } from '../../types';
import { formatPrice } from '../../utils/format';

interface JourneySummaryMetrics {
  pagesViewed: number;
  productsViewed: number;
  searches: number;
  wishlistActions: number;
  cartActions: number;
  checkoutStarted: boolean;
  purchaseCompleted: boolean;
}

interface FriendlyAction {
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    bg: string;
    border: string;
    text: string;
    nodeBg: string;
    nodeRing: string;
  };
  badge?: string;
  detail?: string;
}

export const AdminCustomerJourneyPage: React.FC = () => {
  const [journeys, setJourneys] = useState<CustomerJourney[]>([]);
  const [dropOffSummary, setDropOffSummary] = useState<Array<{ stage: string; count: number }>>([]);
  const [selectedJourney, setSelectedJourney] = useState<CustomerJourney | null>(null);
  const [filterOutcome, setFilterOutcome] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<'CUSTOMERS' | 'ALL' | 'ADMIN'>('CUSTOMERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const loadJourneys = async () => {
    setIsLoading(true);
    try {
      const data = await api.getJourneys();
      const allJourneys: CustomerJourney[] = data.journeys || [];
      setJourneys(allJourneys);
      setDropOffSummary(data.drop_off_summary || []);
      
      // Select first relevant journey
      if (allJourneys.length > 0) {
        const defaultSelected = allJourneys.find(j => !j.is_admin_session) || allJourneys[0];
        setSelectedJourney(defaultSelected);
      } else {
        setSelectedJourney(null);
      }
    } catch (err) {
      console.error('Failed to load customer journeys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJourneys();
  }, []);

  // Filter journeys based on audience, outcome, and search term
  const filteredJourneys = journeys.filter((j) => {
    // Audience filter: Shoppers (default), All, or Admin
    if (audienceFilter === 'CUSTOMERS' && j.is_admin_session) return false;
    if (audienceFilter === 'ADMIN' && !j.is_admin_session) return false;

    // Outcome filter
    if (filterOutcome !== 'ALL' && j.outcome !== filterOutcome) return false;

    // Search query: customer name, session ID, or products viewed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = j.user_name?.toLowerCase().includes(q);
      const matchSession = j.session_id?.toLowerCase().includes(q);
      const matchProduct = j.timeline?.some(step => step.product_name?.toLowerCase().includes(q));
      if (!matchName && !matchSession && !matchProduct) return false;
    }

    return true;
  });

  // Convert raw seconds to clean human-readable duration
  const formatDuration = (secs: number): string => {
    if (!secs || secs < 60) return `${secs || 0}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  // Convert raw timestamp to relative offset from start
  const getRelativeOffset = (startTimeStr: string, currentStepTime: string, stepIdx: number): string => {
    if (stepIdx === 0) return 'Start';
    return `Step ${stepIdx + 1}`;
  };

  // Format date time for humans
  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Convert raw event into clear, human-readable customer action
  const getFriendlyAction = (step: JourneyStep): FriendlyAction => {
    const meta = step.metadata || {};

    // 1. Completed Purchase
    if (step.event_type === 'purchase') {
      const orderId = meta.order_id ? `#${meta.order_id}` : undefined;
      const amount = meta.total_amount ? formatPrice(meta.total_amount) : undefined;
      return {
        title: 'Completed Purchase',
        category: 'Order Placed',
        icon: CheckCircle2,
        color: {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          nodeBg: 'bg-emerald-500',
          nodeRing: 'ring-emerald-500/20'
        },
        badge: orderId || amount ? `${orderId ? orderId : ''} ${amount ? `• ${amount}` : ''}`.trim() : 'Payment Verified',
        detail: 'Order confirmed and payment successfully completed.'
      };
    }

    // 2. Checkout Started
    if (step.event_type === 'checkout_started') {
      const items = meta.items_count ? `${meta.items_count} items` : undefined;
      return {
        title: 'Started Checkout',
        category: 'Checkout Process',
        icon: CreditCard,
        color: {
          bg: 'bg-violet-500/10',
          border: 'border-violet-500/30',
          text: 'text-violet-400',
          nodeBg: 'bg-violet-500',
          nodeRing: 'ring-violet-500/20'
        },
        badge: items,
        detail: 'Customer opened checkout to review delivery details and payment options.'
      };
    }

    // 3. Added to Cart
    if (step.event_type === 'add_to_cart') {
      const name = step.product_name || meta.product_name;
      const qty = meta.quantity && meta.quantity > 1 ? `Qty: ${meta.quantity}` : undefined;
      const price = meta.price ? formatPrice(meta.price) : undefined;
      return {
        title: name ? `Added "${name}" to Cart` : 'Added Item to Cart',
        category: 'Cart Action',
        icon: ShoppingBag,
        color: {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          nodeBg: 'bg-amber-500',
          nodeRing: 'ring-amber-500/20'
        },
        badge: [qty, price].filter(Boolean).join(' • ') || undefined,
        detail: 'Added item to shopping cart for purchase.'
      };
    }

    // 4. Removed from Cart
    if (step.event_type === 'remove_from_cart') {
      const name = step.product_name || meta.product_name;
      return {
        title: name ? `Removed "${name}" from Cart` : 'Removed Item from Cart',
        category: 'Cart Update',
        icon: Trash2,
        color: {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          nodeBg: 'bg-rose-500',
          nodeRing: 'ring-rose-500/20'
        },
        detail: 'Customer removed this item from their basket.'
      };
    }

    // 5. Read Reviews
    if (step.event_type === 'review_view') {
      const name = step.product_name || meta.product_name;
      return {
        title: name ? `Read Reviews for "${name}"` : 'Read Product Reviews',
        category: 'Customer Research',
        icon: Star,
        color: {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          nodeBg: 'bg-yellow-500',
          nodeRing: 'ring-yellow-500/20'
        },
        detail: 'Checked star ratings and reviews from verified customers.'
      };
    }

    // 6. Viewed Product
    if (step.event_type === 'product_view') {
      const name = step.product_name || meta.product_name;
      const price = meta.price ? formatPrice(meta.price) : undefined;
      const category = meta.category;
      return {
        title: name ? `Viewed "${name}"` : 'Viewed Product Details',
        category: 'Product Exploration',
        icon: Eye,
        color: {
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/30',
          text: 'text-indigo-400',
          nodeBg: 'bg-indigo-500',
          nodeRing: 'ring-indigo-500/20'
        },
        badge: [category, price].filter(Boolean).join(' • ') || undefined,
        detail: 'Examined product photos, specifications, and pricing.'
      };
    }

    // 7. Searched Catalog
    if (step.event_type === 'search') {
      const keyword = meta.keyword;
      return {
        title: keyword ? `Searched "${keyword}"` : 'Searched Products',
        category: 'Search',
        icon: Search,
        color: {
          bg: 'bg-sky-500/10',
          border: 'border-sky-500/30',
          text: 'text-sky-400',
          nodeBg: 'bg-sky-500',
          nodeRing: 'ring-sky-500/20'
        },
        badge: keyword ? `Keyword: "${keyword}"` : undefined,
        detail: 'Looked up matching products in the storefront catalog.'
      };
    }

    // 8. Wishlist
    if (step.event_type === 'wishlist') {
      const name = step.product_name || meta.product_name;
      return {
        title: name ? `Added "${name}" to Wishlist` : 'Added Product to Wishlist',
        category: 'Saved Item',
        icon: Heart,
        color: {
          bg: 'bg-pink-500/10',
          border: 'border-pink-500/30',
          text: 'text-pink-400',
          nodeBg: 'bg-pink-500',
          nodeRing: 'ring-pink-500/20'
        },
        detail: 'Saved product for future reference and comparison.'
      };
    }

    // 9. AI Recommendation Click
    if (step.event_type === 'recommendation_click') {
      const name = step.product_name || meta.product_name;
      return {
        title: name ? `Clicked AI Recommendation: "${name}"` : 'Explored AI Recommendation',
        category: 'Personalized Suggestion',
        icon: Sparkles,
        color: {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          text: 'text-purple-400',
          nodeBg: 'bg-purple-500',
          nodeRing: 'ring-purple-500/20'
        },
        detail: 'Interacted with AI-powered personalized product suggestions.'
      };
    }

    // 10. Logout
    if (step.event_type === 'logout') {
      return {
        title: 'Customer Logged Out',
        category: 'Authentication',
        icon: LogOut,
        color: {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          nodeBg: 'bg-slate-500',
          nodeRing: 'ring-slate-500/20'
        },
        detail: 'Session securely signed out.'
      };
    }

    // 11. Page Views (Human translation of routes)
    if (step.event_type === 'page_view') {
      const p = step.page || '';

      if (meta.action === 'login') {
        return {
          title: 'Customer Logged In',
          category: 'Authentication',
          icon: LogIn,
          color: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            nodeBg: 'bg-emerald-500',
            nodeRing: 'ring-emerald-500/20'
          },
          detail: 'User authenticated successfully.'
        };
      }

      if (meta.action === 'register') {
        return {
          title: 'Created New Account',
          category: 'Authentication',
          icon: UserPlus,
          color: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            nodeBg: 'bg-emerald-500',
            nodeRing: 'ring-emerald-500/20'
          },
          detail: 'New customer account created and signed in.'
        };
      }

      if (p === '/' || p === '') {
        return {
          title: 'Home',
          category: 'Storefront',
          icon: Home,
          color: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            nodeBg: 'bg-blue-500',
            nodeRing: 'ring-blue-500/20'
          },
          detail: 'Browsed store homepage and featured offerings.'
        };
      }

      if (p === '/products') {
        return {
          title: 'Browsed Product Catalog',
          category: 'Storefront',
          icon: Layers,
          color: {
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/30',
            text: 'text-indigo-400',
            nodeBg: 'bg-indigo-500',
            nodeRing: 'ring-indigo-500/20'
          },
          detail: 'Explored the all-products catalog.'
        };
      }

      if (p === '/cart') {
        return {
          title: 'Reviewed Shopping Cart',
          category: 'Cart',
          icon: ShoppingBasket,
          color: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            nodeBg: 'bg-amber-500',
            nodeRing: 'ring-amber-500/20'
          },
          detail: 'Inspected items, quantities, and subtotal in cart.'
        };
      }

      if (p === '/checkout') {
        return {
          title: 'Viewed Checkout Page',
          category: 'Checkout',
          icon: CreditCard,
          color: {
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/30',
            text: 'text-violet-400',
            nodeBg: 'bg-violet-500',
            nodeRing: 'ring-violet-500/20'
          },
          detail: 'Opened checkout page to place an order.'
        };
      }

      if (p === '/wishlist') {
        return {
          title: 'Viewed Saved Wishlist',
          category: 'Wishlist',
          icon: Heart,
          color: {
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/30',
            text: 'text-pink-400',
            nodeBg: 'bg-pink-500',
            nodeRing: 'ring-pink-500/20'
          },
          detail: 'Reviewed saved wishlist items.'
        };
      }

      if (p === '/orders') {
        return {
          title: 'Viewed Order History',
          category: 'Account',
          icon: CheckCircle2,
          color: {
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/30',
            text: 'text-teal-400',
            nodeBg: 'bg-teal-500',
            nodeRing: 'ring-teal-500/20'
          },
          detail: 'Checked previous orders and shipping updates.'
        };
      }

      if (p === '/login' || p === '/register') {
        return {
          title: p === '/login' ? 'Visited Sign-In Portal' : 'Visited Registration Page',
          category: 'Authentication',
          icon: User,
          color: {
            bg: 'bg-slate-500/10',
            border: 'border-slate-500/30',
            text: 'text-slate-400',
            nodeBg: 'bg-slate-500',
            nodeRing: 'ring-slate-500/20'
          },
          detail: 'Navigated to user authorization portal.'
        };
      }

      if (p.startsWith('/admin')) {
        return {
          title: `Admin: ${p.replace('/admin/', '').replace(/_/g, ' ')}`,
          category: 'Admin Operations',
          icon: Shield,
          color: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
            text: 'text-purple-400',
            nodeBg: 'bg-purple-500',
            nodeRing: 'ring-purple-500/20'
          },
          detail: 'Administrative management view.'
        };
      }

      // Default page view
      return {
        title: `Viewed Page: ${p}`,
        category: 'Navigation',
        icon: Layers,
        color: {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          nodeBg: 'bg-slate-500',
          nodeRing: 'ring-slate-500/20'
        },
        detail: 'Navigated storefront section.'
      };
    }

    // Generic fallback
    return {
      title: step.event_type.replace(/_/g, ' '),
      category: 'Store Interaction',
      icon: Layers,
      color: {
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        text: 'text-slate-400',
        nodeBg: 'bg-slate-500',
        nodeRing: 'ring-slate-500/20'
      },
      detail: 'Customer action in storefront.'
    };
  };

  // Compute 7 simple summary metrics for the selected journey
  const computeJourneySummary = (timeline: JourneyStep[]): JourneySummaryMetrics => {
    let pagesViewed = 0;
    let productsViewed = 0;
    let searches = 0;
    let wishlistActions = 0;
    let cartActions = 0;
    let checkoutStarted = false;
    let purchaseCompleted = false;

    timeline.forEach((step) => {
      if (step.event_type === 'page_view') pagesViewed++;
      if (step.event_type === 'product_view') productsViewed++;
      if (step.event_type === 'search') searches++;
      if (step.event_type === 'wishlist') wishlistActions++;
      if (step.event_type === 'add_to_cart') cartActions++;
      if (step.event_type === 'checkout_started') checkoutStarted = true;
      if (step.event_type === 'purchase') purchaseCompleted = true;
    });

    return {
      pagesViewed,
      productsViewed,
      searches,
      wishlistActions,
      cartActions,
      checkoutStarted,
      purchaseCompleted
    };
  };

  // Generate a clear, human-readable customer behaviour insight strictly from real events
  const generateBehaviorInsight = (journey: CustomerJourney, metrics: JourneySummaryMetrics) => {
    if (journey.is_admin_session) {
      return {
        title: 'Administrative Session',
        text: 'This session represents administrator dashboard operations. It is automatically separated from customer conversion metrics.',
        badge: 'Admin Activity',
        color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
        icon: Shield
      };
    }

    if (metrics.purchaseCompleted) {
      if (metrics.productsViewed >= 3 || metrics.cartActions >= 2 || journey.duration_secs > 180) {
        return {
          title: 'High Intent Buyer',
          text: 'Customer showed strong engagement, thoroughly explored multiple products, and completed a purchase.',
          badge: 'Completed Purchase',
          color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          icon: CheckCircle2
        };
      }
      return {
        title: 'Direct Purchase Conversion',
        text: 'Customer arrived with clear intent, swiftly added items to cart, and completed a purchase.',
        badge: 'Fast Conversion',
        color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        icon: CheckCircle2
      };
    }

    if (metrics.checkoutStarted) {
      return {
        title: 'Checkout Friction Drop-off',
        text: 'Customer reached the checkout page with items in cart, but dropped off before completing payment.',
        badge: 'Checkout Abandoned',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        icon: AlertTriangle
      };
    }

    if (metrics.cartActions > 0) {
      return {
        title: 'Cart Abandonment',
        text: 'Customer viewed multiple products and added an item to cart but did not complete checkout.',
        badge: 'Cart Abandoned',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        icon: ShoppingBag
      };
    }

    if (metrics.wishlistActions > 0) {
      return {
        title: 'Wishlist Consideration',
        text: 'Customer saved products to their wishlist for later consideration without adding them to cart.',
        badge: 'Wishlist Saved',
        color: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        icon: Heart
      };
    }

    if (metrics.productsViewed >= 2 || metrics.searches >= 2) {
      return {
        title: 'Catalog Exploration',
        text: 'Customer actively searched and viewed products across the store, but did not commit items to the cart.',
        badge: 'Engaged Browser',
        color: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        icon: Compass
      };
    }

    return {
      title: 'Casual Browsing',
      text: 'Customer browsed products but showed low purchase engagement.',
      badge: 'Browsing Only',
      color: 'border-slate-700 bg-slate-800/40 text-slate-300',
      icon: Compass
    };
  };

  const getOutcomeBadge = (outcome: string, isAdmin?: boolean) => {
    if (isAdmin) {
      return {
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        icon: Shield,
        text: 'Admin Session'
      };
    }

    switch (outcome) {
      case 'Purchased':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: CheckCircle2,
          text: 'Purchased'
        };
      case 'Abandoned Cart':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
          text: 'Cart Abandoned'
        };
      default:
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          icon: Compass,
          text: 'Browsing Only'
        };
    }
  };

  const copySessionId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  const selectedMetrics = selectedJourney ? computeJourneySummary(selectedJourney.timeline) : null;
  const selectedInsight = selectedJourney && selectedMetrics ? generateBehaviorInsight(selectedJourney, selectedMetrics) : null;

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Customer Flow Reconstruction</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Customer Journey Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Understand how shoppers browse, compare, add to cart, and either purchase or drop off in your store.
          </p>
        </div>

        <button
          onClick={loadJourneys}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-2 transition-all self-start sm:self-auto border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Sessions</span>
        </button>
      </div>

      {/* Common Drop-Off Points Diagnostics Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400">
            <GitFork className="w-5 h-5" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Where Shoppers Leave Without Purchasing
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Customer Drop-Off Diagnostics</span>
        </div>
        <p className="text-xs text-slate-400">
          Identifies the final customer touchpoint before session drop-off across all non-purchasing visitors:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {dropOffSummary.map((d, i) => (
            <div key={i} className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-300 font-bold block">{d.stage}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {d.stage === 'Home / Landing' && 'Left store immediately'}
                  {d.stage === 'Search' && 'Left after searching'}
                  {d.stage === 'Product View' && 'Viewed but did not add'}
                  {d.stage === 'Cart' && 'Added items, did not checkout'}
                  {d.stage === 'Checkout' && 'Started checkout, did not pay'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-3">
                <span className="text-2xl font-black text-rose-400">{d.count}</span>
                <span className="text-[10px] text-slate-500 font-medium">drop-offs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area: Session Cards (Left) and Detailed Shopping Journey (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customer Journey Session Cards */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          
          {/* Controls: Audience & Outcome Filters */}
          <div className="space-y-3 border-b border-slate-800 pb-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Shopping Sessions
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">
                {filteredJourneys.length} {filteredJourneys.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>

            {/* Audience Tabs: Shoppers Only (Default) vs All vs Admin */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setAudienceFilter('CUSTOMERS')}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  audienceFilter === 'CUSTOMERS'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Shoppers Only
              </button>
              <button
                onClick={() => setAudienceFilter('ALL')}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  audienceFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Sessions
              </button>
              <button
                onClick={() => setAudienceFilter('ADMIN')}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  audienceFilter === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin Only
              </button>
            </div>

            {/* Search and Outcome Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-7 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search customer / product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-5 flex items-center space-x-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={filterOutcome}
                  onChange={(e) => setFilterOutcome(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer w-full"
                >
                  <option value="ALL">All Outcomes</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Abandoned Cart">Cart Abandoned</option>
                  <option value="Browsing Only">Browsing Only</option>
                </select>
              </div>
            </div>

          </div>

          {/* Session Cards List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-800/60 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredJourneys.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <Compass className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-400">No matching sessions found</p>
              <p className="text-[11px] text-slate-500">
                {audienceFilter === 'CUSTOMERS'
                  ? 'Try selecting "All Sessions" or clearing your search filters.'
                  : 'Adjust your filter to view other sessions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredJourneys.map((j) => {
                const badge = getOutcomeBadge(j.outcome, j.is_admin_session);
                const BadgeIcon = badge.icon;
                const isSelected = selectedJourney?.session_id === j.session_id;

                // Quick preview summary
                const prodViews = j.timeline.filter(t => t.event_type === 'product_view').length;
                const hasCart = j.timeline.some(t => t.event_type === 'add_to_cart');

                return (
                  <button
                    key={j.session_id}
                    onClick={() => {
                      setSelectedJourney(j);
                      setShowTechDetails(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    
                    {/* Top Row: Customer Name & Outcome */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 truncate">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          j.is_admin_session ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {j.user_name}
                        </span>
                      </div>

                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.text}</span>
                      </span>
                    </div>

                    {/* Middle Row: Session Date & Time */}
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDisplayDate(j.start_time)}</span>
                      </span>
                    </div>

                    {/* Bottom Row: Metrics & Quick Preview */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                      <span className="text-slate-400 font-medium">
                        ⏱️ {formatDuration(j.duration_secs)} • {j.event_count} {j.event_count === 1 ? 'action' : 'actions'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {j.is_admin_session
                          ? 'Dashboard Activity'
                          : `${prodViews} ${prodViews === 1 ? 'view' : 'views'}${hasCart ? ' • In Cart' : ''}`}
                      </span>
                    </div>

                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Selected Journey Shopping Flow & Visual Timeline */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          {selectedJourney ? (
            <>
              {/* Selected Customer Header Banner */}
              <div className="border-b border-slate-800 pb-5 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                          <span>{selectedJourney.user_name}</span>
                          {selectedJourney.is_admin_session && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                              Admin
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Session started: {formatDisplayDate(selectedJourney.start_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {(() => {
                      const badge = getOutcomeBadge(selectedJourney.outcome, selectedJourney.is_admin_session);
                      const BadgeIcon = badge.icon;
                      return (
                        <div className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                          <BadgeIcon className="w-4 h-4" />
                          <span>{badge.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Key Summary Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-bold text-white">{formatDuration(selectedJourney.duration_secs)}</span>
                  </div>

                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-slate-400">Total Actions:</span>
                    <span className="font-bold text-white">{selectedJourney.event_count}</span>
                  </div>

                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400">Outcome:</span>
                    <span className="font-bold text-white">{selectedJourney.outcome}</span>
                  </div>
                </div>

              </div>

              {/* Customer Behaviour Insight (Grounded in Actual Events) */}
              {selectedInsight && (
                <div className={`border rounded-2xl p-4.5 ${selectedInsight.color} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">
                        Customer Behaviour Insight
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/60 border border-current">
                      {selectedInsight.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    "{selectedInsight.text}"
                  </p>
                </div>
              )}

              {/* Journey Summary: 7 Simple Metric Cards */}
              {selectedMetrics && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Journey Summary Metrics
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    
                    {/* 1. Pages Viewed */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block">Pages</span>
                      <span className="text-lg font-black text-white mt-0.5 block">
                        {selectedMetrics.pagesViewed}
                      </span>
                    </div>

                    {/* 2. Products Viewed */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block">Products</span>
                      <span className="text-lg font-black text-indigo-400 mt-0.5 block">
                        {selectedMetrics.productsViewed}
                      </span>
                    </div>

                    {/* 3. Searches */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block">Searches</span>
                      <span className="text-lg font-black text-sky-400 mt-0.5 block">
                        {selectedMetrics.searches}
                      </span>
                    </div>

                    {/* 4. Wishlist Actions */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block">Wishlist</span>
                      <span className="text-lg font-black text-pink-400 mt-0.5 block">
                        {selectedMetrics.wishlistActions}
                      </span>
                    </div>

                    {/* 5. Cart Actions */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block">Cart Items</span>
                      <span className="text-lg font-black text-amber-400 mt-0.5 block">
                        {selectedMetrics.cartActions}
                      </span>
                    </div>

                    {/* 6. Checkout */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 font-semibold block">Checkout</span>
                      <span className={`text-xs font-extrabold mt-1.5 block ${
                        selectedMetrics.checkoutStarted ? 'text-violet-400' : 'text-slate-600'
                      }`}>
                        {selectedMetrics.checkoutStarted ? 'Yes' : 'No'}
                      </span>
                    </div>

                    {/* 7. Purchase */}
                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-semibold block">Purchase</span>
                      <span className={`text-xs font-extrabold mt-1.5 block ${
                        selectedMetrics.purchaseCompleted ? 'text-emerald-400' : 'text-slate-600'
                      }`}>
                        {selectedMetrics.purchaseCompleted ? 'Completed' : 'No'}
                      </span>
                    </div>

                  </div>
                </div>
              )}

              {/* Clean Visual Shopping Timeline */}
              <div className="space-y-4 pt-2">
                
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>Visual Shopping Journey Flow</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Chronological Step-by-Step Actions
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                  {selectedJourney.timeline.map((step, idx) => {
                    const action = getFriendlyAction(step);
                    const ActionIcon = action.icon;
                    const isLast = idx === selectedJourney.timeline.length - 1;

                    return (
                      <div key={step.id || idx} className="relative flex items-start space-x-4 group">
                        
                        {/* Node circle */}
                        <div
                          className={`absolute -left-6 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ${action.color.nodeBg} ${action.color.nodeRing}`}
                        >
                          <ActionIcon className="w-3 h-3" />
                        </div>

                        {/* Event Card */}
                        <div className="flex-1 bg-slate-950 border border-slate-800/90 rounded-2xl p-4 hover:border-slate-700 transition-all shadow-sm space-y-2">
                          
                          {/* Card Header: Friendly Title & Timestamp */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-white">
                                {action.title}
                              </span>
                              {action.badge && (
                                <span className="text-[10px] font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300">
                                  {action.badge}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                              <span className="text-slate-500">{getRelativeOffset(selectedJourney.start_time, step.timestamp, idx)}</span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{step.timestamp}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Body: Explanation */}
                          {action.detail && (
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {action.detail}
                            </p>
                          )}

                        </div>

                        {/* Downward Flow Connector */}
                        {!isLast && (
                          <div className="absolute -left-4 top-10 text-slate-600 hidden group-hover:block">
                            <ArrowDown className="w-3 h-3" />
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* Milestone Journey Outcome Conclusion Banner */}
                <div className={`mt-6 p-4 rounded-2xl border flex items-center justify-between ${
                  selectedJourney.outcome === 'Purchased'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : selectedJourney.outcome === 'Abandoned Cart'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-3">
                    {selectedJourney.outcome === 'Purchased' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : selectedJourney.outcome === 'Abandoned Cart' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Compass className="w-5 h-5 text-sky-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold block text-white">
                        {selectedJourney.outcome === 'Purchased' && '🎉 Journey Milestone: Successful Purchase Placed'}
                        {selectedJourney.outcome === 'Abandoned Cart' && '⚠️ Journey Milestone: Cart Abandoned Before Checkout'}
                        {selectedJourney.outcome === 'Browsing Only' && '🧭 Journey Milestone: Store Browsing Completed'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {selectedJourney.outcome === 'Purchased' && 'Customer successfully completed all stages of the conversion funnel.'}
                        {selectedJourney.outcome === 'Abandoned Cart' && 'Customer added products to cart but dropped off before paying.'}
                        {selectedJourney.outcome === 'Browsing Only' && 'Customer explored catalog pages and exited.'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Optional Section: View Technical Details (Hidden for normal users by default) */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                
                <button
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-between transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>View Technical Details (Session ID, Event Types & Raw JSON)</span>
                  </div>
                  {showTechDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showTechDetails && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 space-y-4 text-xs">
                    
                    {/* Technical Metadata Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800 font-mono text-[11px]">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Session ID (UUID)</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-indigo-300 truncate">{selectedJourney.session_id}</span>
                          <button
                            onClick={() => copySessionId(selectedJourney.session_id)}
                            className="p-1 hover:text-white text-slate-400 transition-colors ml-2"
                            title="Copy Session ID"
                          >
                            {copiedSessionId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">User Identity</span>
                        <div className="mt-1 text-slate-300">
                          ID: {selectedJourney.user_id || 'null (Guest)'} • Role: {selectedJourney.user_role || 'VISITOR'}
                        </div>
                      </div>
                    </div>

                    {/* Raw Event Stream Table */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Raw Clickstream Log Records ({selectedJourney.timeline.length} records)
                      </span>

                      <div className="overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="w-full text-left font-mono text-[10px] text-slate-400">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500">
                              <th className="py-1 px-2">#</th>
                              <th className="py-1 px-2">event_type</th>
                              <th className="py-1 px-2">page</th>
                              <th className="py-1 px-2">product_id</th>
                              <th className="py-1 px-2">timestamp</th>
                              <th className="py-1 px-2">raw metadata</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedJourney.timeline.map((step, idx) => (
                              <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/50">
                                <td className="py-1.5 px-2 text-slate-600">{idx + 1}</td>
                                <td className="py-1.5 px-2 text-indigo-400 font-bold">{step.event_type}</td>
                                <td className="py-1.5 px-2 text-slate-300">{step.page || '-'}</td>
                                <td className="py-1.5 px-2 text-slate-400">{step.product_id || '-'}</td>
                                <td className="py-1.5 px-2 text-slate-500">{step.timestamp}</td>
                                <td className="py-1.5 px-2 text-slate-400 max-w-xs truncate">
                                  {step.metadata && Object.keys(step.metadata).length > 0
                                    ? JSON.stringify(step.metadata)
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </>
          ) : (
            <div className="text-center py-24 text-slate-500 space-y-3">
              <Compass className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">
                Select a browsing session from the left to view its shopping journey.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Customer journeys show each step a shopper took from entering the store to purchasing or dropping off.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
