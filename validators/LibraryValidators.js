const NameValidator = (name) => {
    if (!name) {
        return {
            valid: false,
            message: {
                en: "Library Name is required",
                hi: "लाइब्रेरी का नाम आवश्यक है"
            }
        };
    }
    if (name.length <= 4) {
        return {
            valid: false,
            message: {
                en: "Library Name should be more than 5 characters.",
                hi: "लाइब्रेरी का नाम 5 से अधिक अक्षरों का होना चाहिए।"
            }
        };
    }
    if (!/^[a-zA-Z]+$/.test(name)) {
        return {
            valid: false,
            message: {
                en: "Library Name should contain only alphabets.",
                hi: "लाइब्रेरी का नाम केवल अक्षरों का होना चाहिए।"
            }
        };
    }
    return { valid: true };
};



const locationValidator = (location) => {
    if (!location) {
        return {
            valid: false,
            message: {
                en: "Location name is needed",
                hi: "स्थान का नाम आवश्यक है"
            }
        };
    }

    return { valid: true };
};



const contactValidator = (contact) => {
    if (!contact) {
        return {
            valid: false,
            message: {
                en: "Contact number should be provided",
                hi: "संपर्क नंबर प्रदान किया जाना चाहिए"
            }
        };
    }

    // Check if the contact number is 10 digits long
    const isTenDigits = /^\d{10}$/.test(contact);
    if (!isTenDigits) {
        return {
            valid: false,
            message: {
                en: "Contact number should be exactly 10 digits",
                hi: "संपर्क नंबर बिल्कुल 10 अंक का होना चाहिए"
            }
        };
    }

    // If the contact number is valid
    return {
        valid: true,
       
    };
};


module.exports={
    NameValidator,
    locationValidator,
    contactValidator
}
