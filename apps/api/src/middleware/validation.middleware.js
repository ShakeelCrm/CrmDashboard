// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Validate password strength
export const validatePassword = (password) => {
    // At least 8 characters, with at least one uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
// Validate required fields
export const validateRequiredFields = (obj, requiredFields) => {
    const missingFields = [];
    for (const field of requiredFields) {
        if (!obj[field]) {
            missingFields.push(field);
        }
    }
    return missingFields;
};
// Validation middleware for user creation
export const validateUserCreation = (req, res, next) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json({
            success: false,
            error: "Email, name, and password are required",
        });
    }
    if (!validateEmail(email)) {
        return res.status(400).json({
            success: false,
            error: "Invalid email format",
        });
    }
    if (!validatePassword(password)) {
        return res.status(400).json({
            success: false,
            error: "Password must be at least 8 characters with uppercase, lowercase, and number",
        });
    }
    next();
};
