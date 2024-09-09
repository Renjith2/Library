/**
 * This function validates a given name based on specific criteria:
 * 
 * 1. It checks if the name is provided. If not, it returns a validation error message.
 * 2. It checks if the name is more than 5 characters long. If not, it returns a validation error.
 * 3. It checks if the name contains only alphabetic characters (A-Z or a-z). If not, it returns a validation error.
 * 
 * The function returns an object with a `valid` property (boolean) and a `message` property (containing error messages in both English and Hindi).
 */

const validateName = (name) => {
    if (!name) {
        return {
            valid: false,
            message: {
                en: "Name is required.",
                hi: "नाम आवश्यक है।"
            }
        };
    }
    if (name.length <= 4) {
        return {
            valid: false,
            message: {
                en: "Name should be more than 5 characters.",
                hi: "नाम 5 अक्षरों से अधिक होना चाहिए।"
            }
        };
    }
    if (!/^[a-zA-Z]+$/.test(name)) {
        return {
            valid: false,
            message: {
                en: "Name should contain only alphabets.",
                hi: "नाम में केवल अक्षर होने चाहिए।"
            }
        };
    }
    return { valid: true };
};

/**
 * This function validates a given email based on specific criteria:
 
 * 1. It checks if the email is provided. If not, it returns a validation error message.
 * 2. It checks if the email ends with "@gmail.com". If not, it returns a validation error.
 * The function returns an object with a `valid` property (boolean) and a `message` property (containing error messages in both English and Hindi).
 */


const validateEmail = (email) => {
    if (!email) {
        return {
            valid: false,
            message: {
                en: "Email is required.",
                hi: "ईमेल आवश्यक है।"
            }
        };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
            valid: false,
            message: {
                en: "Invalid email format.",
                hi: "अवैध ईमेल प्रारूप।"
            }
        };
    }
    if (!email.endsWith('@gmail.com')) {
        return {
            valid: false,
            message: {
                en: "Email must end with @gmail.com.",
                hi: "ईमेल को @gmail.com के साथ समाप्त होना चाहिए।"
            }
        };
    }
    return { valid: true };
};

/**
 * This function validates a given password based on specific criteria:
 * 
 * 1. It checks if the password is provided. If not, it returns a validation error message.
 * 2. It checks if the password is at least 10 characters long. If not, it returns a validation error.
 * 3. It checks if the password contains at least one uppercase letter, one lowercase letter, and one digit. If not, it returns a validation error.
 * 
 * The function returns an object with a `valid` property (boolean) and a `message` property (containing error messages in both English and Hindi).
 */

const validatePassword = (password) => {
    if (!password) {
        return {
            valid: false,
            message: {
                en: "Password is required.",
                hi: "पासवर्ड आवश्यक है।"
            }
        };
    }
    if (password.length < 10) {
        return {
            valid: false,
            message: {
                en: "Password should be at least 10 characters long.",
                hi: "पासवर्ड कम से कम 10 अक्षरों का होना चाहिए।"
            }
        };
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return {
            valid: false,
            message: {
                en: "Password must contain at least one uppercase letter, one lowercase letter, and one digit.",
                hi: "पासवर्ड में कम से कम एक अपरकेस अक्षर, एक लोअरकेस अक्षर और एक अंक होना चाहिए।"
            }
        };
    }
    return { valid: true };
};

module.exports = {
    validateName,
    validateEmail,
    validatePassword
};