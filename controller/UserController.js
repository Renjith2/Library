
const bcrypt = require('bcryptjs');
const User = require('../models/UserSchema');
const { validateName, validateEmail, validatePassword } = require('../validators/UserValidations');
const jwt = require('jsonwebtoken');

const registerController = async (req, res) => {
    try {
                // Check the language header; default to English ('en') if not provided
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        

        const { name, email, password } = req.body;

        let validationErrors = [];
        

        // Validate the name
        const nameValidation = validateName(name, language);
        if (!nameValidation.valid) {
            validationErrors.push(nameValidation.message[language]);
        }

        // Validate the email
        const emailValidation = validateEmail(email, language);
        if (!emailValidation.valid) {
            validationErrors.push(emailValidation.message[language]);
        }

        // Validate the password
        const passwordValidation = validatePassword(password, language);
        if (!passwordValidation.valid) {
            validationErrors.push(passwordValidation.message[language]);
        }

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return res.status(400).json({
                messages: validationErrors
            });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: {
                    en: "Email already registered.",
                    hi: "ईमेल पहले से पंजीकृत है।"
                }[language]
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(201).json({
            message: {
                en: "User registered successfully.",
                hi: "उपयोगकर्ता सफलतापूर्वक पंजीकृत हुआ।"
            }[language]
        });
    } catch (error) {
        return res.status(500).json({
            message: {
                en: "Server error. Please try again later.",
                hi: "सर्वर में त्रुटि। कृपया बाद में पुनः प्रयास करें।"
            }[language]
        });
    }
}
const loginController =async (req, res) => {
    try {
        // Check the language header; default to English ('en') if not provided
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

        const { email, password } = req.body;

        let validationErrors = [];

        // Validate the email
        const emailValidation = validateEmail(email, language);
        if (!emailValidation.valid) {
            validationErrors.push(emailValidation.message[language]);
        }

        // Validate the password
        const passwordValidation = validatePassword(password, language);
        if (!passwordValidation.valid) {
            validationErrors.push(passwordValidation.message[language]);
        }

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return res.status(400).json({
                messages: validationErrors
            });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: {
                    en: "Invalid email.",
                    hi: "अमान्य ईमेल"
                }[language]
            });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: {
                    en: "Invalid  password.",
                    hi: "अमान्य  पासवर्ड।"
                }[language]
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            message: {
                en: "Login successful.",
                hi: "लॉगिन सफल।"
            }[language],
            token
        });
    } catch (error) {
        return res.status(500).json({
            message: {
                en: "Server error. Please try again later.",
                hi: "सर्वर में त्रुटि। कृपया बाद में पुनः प्रयास करें।"
            }[language]
        });
    }
}

module.exports ={
    registerController,
    loginController
}