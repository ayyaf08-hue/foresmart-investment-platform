// إدارة المستخدمين
let users = JSON.parse(localStorage.getItem('fs_users') || '{}');
let currentUser = JSON.parse(localStorage.getItem('fs_current_user') || 'null');

// المستخدم الافتراضي (الأدمن الجديد)
if (!users['Ayyaf08@hotmail.com']) {
    users['Ayyaf08@hotmail.com'] = {
        email: 'Ayyaf08@hotmail.com',
        password: 'Admin@ForeSmart2025',
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
        emailVerified: true
    };
    localStorage.setItem('fs_users', JSON.stringify(users));
}

// دالة تسجيل الدخول
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

// دالة إنشاء حساب جديد (مع 14 يوم تجريبي)
function register(email, password, firstName, lastName, phone, nationalId) {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (users[normalizedEmail]) {
        return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً' };
    }
    
    // التحقق من صحة رقم الهوية (أساسي)
    if (!nationalId || nationalId.length < 10) {
        return { success: false, error: 'رقم الهوية الوطنية غير صحيح' };
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
        emailVerified: false
    };
    
    users[normalizedEmail] = newUser;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    currentUser = { ...newUser };
    localStorage.setItem('fs_current_user', JSON.stringify(currentUser));
    
    // محاكاة إرسال بريد ترحيبي (سيتم تفعيله مع SMTP لاحقاً)
    console.log(`📧 بريد ترحيبي مرسل إلى: ${email}`);
    
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

// التحقق من صلاحية الاشتراك
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

// دالة إرسال بريد إلكتروني (للإعداد المستقبلي مع SMTP)
function sendEmail(to, subject, body) {
    // هذه الدالة جاهزة للربط مع SMTP بعد نقل الموقع للدومين
    console.log(`📧 إلى: ${to}`);
    console.log(`📧 الموضوع: ${subject}`);
    console.log(`📧 المحتوى: ${body}`);
    return { success: true, message: 'تم إرسال البريد (محاكاة)' };
}

// دالة إعادة تعيين كلمة المرور (جاهزة للتطوير)
function resetPassword(email) {
    const user = users[email];
    if (!user) return { success: false, error: 'البريد الإلكتروني غير مسجل' };
    
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    users[email] = user;
    localStorage.setItem('fs_users', JSON.stringify(users));
    
    sendEmail(email, 'إعادة تعيين كلمة المرور - ForeSmart', 
        `تم إعادة تعيين كلمة المرور الخاصة بك. كلمة المرور الجديدة: ${tempPassword}\nيرجى تغييرها بعد تسجيل الدخول.`);
    
    return { success: true, message: 'تم إرسال كلمة المرور الجديدة إلى بريدك الإلكتروني' };
}
