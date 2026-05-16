// خطط الاشتراك والمميزات - ForeSmart Investment
const PLANS = {
    free_trial: {
        name: "تجريبي مجاني",
        duration_days: 14,
        price_monthly: 0,
        price_yearly: 0,
        features: {
            max_portfolio_size: 1,           // أصل واحد فقط
            ai_recommendations: true,         // توصيات AI
            basic_markets: true,              // أسواق محدودة
            paper_trading: true,              // تداول تجريبي
            advanced_analytics: false,
            priority_support: false,
            api_access: false,
            bank_integration: false
        }
    },
    basic: {
        name: "الاشتراك العادي",
        price_monthly: 100,
        price_yearly: 200,
        features: {
            max_portfolio_size: 5,             // 5 أصول
            ai_recommendations: true,
            basic_markets: true,
            advanced_markets: false,
            paper_trading: true,
            advanced_analytics: false,
            priority_support: false,
            api_access: false,
            bank_integration: false
        }
    },
    pro: {
        name: "الاشتراك برو",
        price_monthly: 200,
        price_yearly: 300,
        features: {
            max_portfolio_size: 20,
            ai_recommendations: true,
            basic_markets: true,
            advanced_markets: true,
            paper_trading: true,
            advanced_analytics: true,
            priority_support: true,
            api_access: false,
            bank_integration: false
        }
    },
    vip: {
        name: "الاشتراك VIP",
        price_monthly: 300,
        price_yearly: 500,
        features: {
            max_portfolio_size: 999,
            ai_recommendations: true,
            basic_markets: true,
            advanced_markets: true,
            paper_trading: true,
            advanced_analytics: true,
            priority_support: true,
            api_access: true,
            bank_integration: true,
            personal_account_manager: true
        }
    }
};

// التحقق من صلاحية الاشتراك
function isSubscriptionActive(user) {
    if (!user || !user.subscription_end) return false;
    return new Date(user.subscription_end) > new Date();
}

// الحصول على خطة المستخدم الحالية
function getUserPlan(user) {
    if (!isSubscriptionActive(user)) {
        return PLANS.free_trial;
    }
    return PLANS[user.plan] || PLANS.free_trial;
}

// التحقق من أن المستخدم لديه صلاحية لميزة معينة
function hasFeature(user, featureName) {
    const plan = getUserPlan(user);
    return plan.features[featureName] === true;
}
