// ========================================
// نظام المصادقة وإدارة المستخدمين
// منصة ForeSmart Investment
// ========================================

// تحميل المستخدمين من التخزين المحلي
let users = JSON.parse(localStorage.getItem('fs_users') || '{}');
let currentUser = JSON.parse(localStorage.getItem('fs_current_user') || 'null');

// ========================================
// حساب الأدمن الرئيسي (بريدي الإلكتروني وكلمة المرور المطلوبة)
// ========================================
const ADMIN_EMAIL = 'Ayyaf08@hotmail.com';
const ADMIN_PASSWORD = 'Ayyaf08@2025';

if (!users[ADMIN_EMAIL]) {
    users[ADMIN_EMAIL] = {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'أياف',
        lastName: 'العتيبي',
        phone: '0500000000',
        nationalId: '1000000000',
        name: 'أياف العتيبي',
        role: 'admin',
        plan: 'vip',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        emailVerified: true,
        mustChangePassword: false  // الأدمن لا يحتاج تغيير كلمة المرور فوراً
    };
    localStorage.setItem('fs_users', JSON.stringify(users));
}

// ========================================
// دالة تسجيل الدخول
// ========================================
function login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = users[normalizedEmail];
    
    if (user && user.password === password) {
        currentUser = { ...user };
        localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
        return { success: true, user: currentUser };
    }
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
}

// ========================================
// دالة إنشاء حساب جديد (مع 14 يوم تجريبي)
// ========================================
function register(email, password, firstName, lastName, phone, nationalId) {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (users[normalizedEmail]) {
        return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    
    // التحقق من صحة رقم الهوية
    if (!nationalId || nationalId.length < 10) {
        return { success: false, error: 'رقم الهوية الوطنية غير صحيح (10 أرقام)' };
    }
    
    // التحقق من رقم الجوال
    if (!phone || phone.length < 9) {
        return { success: false, error: 'رقم الجوال غير صحيح' };
    }
    
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    
    const newUser = {
        email: normalizedEmail,
        password: password,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        phone: phone,
        nationalId: nationalId,
        role: 'client',
        plan: 'free_trial',
        subscription_start: new Date().toISOString(),
        subscription_end: trialEnd.toISOString(),
        createdAt: new Date().toISOString(),
        emailVerified: false,
        mustChangePassword: false
    };
    
    users[normalizedEmail] = newUser;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    currentUser = { ...newUser };
    localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
    
    return { success: true, user: currentUser };
}

// ========================================
// دالة تغيير كلمة المرور (داخل الحساب)
// ========================================
function changePassword(email, oldPassword, newPassword, confirmPassword) {
    const user = users[email];
    
    if (!user) {
        return { success: false, error: 'المستخدم غير موجود' };
    }
    
    if (user.password !== oldPassword) {
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    
    if (newPassword !== confirmPassword) {
        return { success: false, error: 'كلمة المرور الجديدة غير متطابقة' };
    }
    
    if (newPassword.length < 6) {
        return { success: false, error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' };
    }
    
    // تحديث كلمة المرور
    user.password = newPassword;
    user.mustChangePassword = false;
    users[email] = user;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    // تحديث المستخدم الحالي إذا كان هو نفسه
    if (currentUser && currentUser.email === email) {
        currentUser.password = newPassword;
        currentUser.mustChangePassword = false;
        localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
    }
    
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
}

// ========================================
// دالة إعادة تعيين كلمة المرور (نسيت كلمة المرور)
// ========================================
function resetPassword(email) {
    const user = users[email];
    if (!user) {
        return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    }
    
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    user.mustChangePassword = true;
    users[email] = user;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    // محاكاة إرسال بريد إلكتروني (سيتم ربطه بـ SMTP لاحقاً)
    console.log(`📧 تم إرسال كلمة مرور مؤقتة إلى: ${email}`);
    console.log(`🔑 كلمة المرور المؤقتة: ${tempPassword}`);
    
    return { success: true, tempPassword: tempPassword, message: 'تم إرسال كلمة مرور مؤقتة إلى بريدك الإلكتروني' };
}

// ========================================
// دالة تسجيل الخروج
// ========================================
function logout() {
    localStorage.removeItem('fs_current_user');
    currentUser = null;
    window.location.href = 'login.html';
}

// ========================================
// دالة ترقية الاشتراك
// ========================================
function upgradeSubscription(email, newPlan, duration) {
    const user = users[email];
    if (!user) return { success: false, error: 'المستخدم غير موجود' };
    
    const plan = PLANS[newPlan];
    if (!plan) return { success: false, error: 'الخطة غير صالحة' };
    
    const price = duration === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const durationDays = duration === 'yearly' ? 365 : 30;
    
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

// ========================================
// التحقق من صلاحية الاشتراك
// ========================================
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

// ========================================
// الحصول على قائمة المستخدمين (للأدمن فقط)
// ========================================
function getAllUsers() {
    if (currentUser?.role !== 'admin') return [];
    return Object.values(users);
}

// ========================================
// الحصول على خطة المستخدم الحالية
// ========================================
function getUserPlan(user) {
    if (!isSubscriptionActive(user)) {
        return PLANS.free_trial;
    }
    return PLANS[user.plan] || PLANS.free_trial;
}

// ========================================
// التحقق من صلاحية الاشتراك
// ========================================
function isSubscriptionActive(user) {
    if (!user || !user.subscription_end) return false;
    return new Date(user.subscription_end) > new Date();
}

// ========================================
// التحقق من وجود ميزة معينة
// ========================================
function hasFeature(user, featureName) {
    const plan = getUserPlan(user);
    return plan.features[featureName] === true;
}
