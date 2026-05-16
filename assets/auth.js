// إدارة المستخدمين
let users = JSON.parse(localStorage.getItem('fs_users') || '{}');
let currentUser = JSON.parse(localStorage.getItem('fs_current_user') || 'null');

// المستخدم الافتراضي (الأدمن)
if (!users['admin@foresmart.com']) {
    users['admin@foresmart.com'] = {
        email: 'admin@foresmart.com',
        password: 'Admin@2025',
        name: 'مدير النظام',
        role: 'admin',
        plan: 'vip',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('fs_users', JSON.stringify(users));
}

// دالة تسجيل الدخول
function login(email, password) {
    const user = users[email];
    if (user && user.password === password) {
        currentUser = { ...user };
        localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
}

// دالة إنشاء حساب جديد (مع 14 يوم تجريبي)
function register(email, password, name) {
    if (users[email]) {
        return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    
    const newUser = {
        email: email,
        password: password,
        name: name,
        role: 'client',
        plan: 'free_trial',
        subscription_start: new Date().toISOString(),
        subscription_end: trialEnd.toISOString(),
        createdAt: new Date().toISOString()
    };
    
    users[email] = newUser;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    currentUser = { ...newUser };
    localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
    
    return { success: true, user: currentUser };
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('fs_current_user');
    currentUser = null;
    window.location.href = 'login.html';
}

// دالة ترقية الاشتراك
function upgradeSubscription(email, newPlan, duration) {
    const user = users[email];
    if (!user) return { success: false, error: 'المستخدم غير موجود' };
    
    const plan = PLANS[newPlan];
    if (!plan) return { success: false, error: 'الخطة غير صالحة' };
    
    const price = duration === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const durationDays = duration === 'yearly' ? 365 : 30;
    
    // محاكاة الدفع (سيتم ربط Moyasar لاحقاً)
    user.plan = newPlan;
    user.subscription_start = new Date().toISOString();
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + durationDays);
    user.subscription_end = newEndDate.toISOString();
    
    users[email] = user;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    if (currentUser && currentUser.email === email) {
        currentUser = { ...user };
        localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
    }
    
    return { success: true, price: price };
}

// التحقق من صلاحية الاشتراك وعرض رسالة إذا انتهى
function checkSubscriptionStatus() {
    if (!currentUser) return null;
    
    const endDate = new Date(currentUser.subscription_end);
    const now = new Date();
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0 && currentUser.plan === 'free_trial') {
        return { expired: true, message: 'انتهت الفترة التجريبية. يرجى الاشتراك في إحدى الباقات للاستمرار.' };
    }
    
    return { expired: false, daysLeft: daysLeft, plan: currentUser.plan };
}

// دالة الحصول على قائمة المستخدمين (للأدمن فقط)
function getAllUsers() {
    if (currentUser?.role !== 'admin') return [];
    return Object.values(users);
}
