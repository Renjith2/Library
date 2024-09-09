const authmiddlewares = require('../middlewares/authmiddlewares');
const Book = require('../models/BookSchema');
const Library= require('../models/LibrarySchema');
const User = require('../models/UserSchema');
const { NameValidator, contactValidator, locationValidator } = require('../validators/LibraryValidators')






const LibraryAdd = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

        const { name, contact, location } = req.body;
        const userId = req.userId; //  User's ID stored in the request, typically done via middleware after authentication

        // Step 1: Check if the user is a library owner
        const user = await User.findById(userId);
        if (!user.isLibraryOwner) {
            return res.status(403).json({
                success: false,
                message: {
                    en: "You are not authorized to add a library.",
                    hi: "आप लाइब्रेरी जोड़ने के लिए अधिकृत नहीं हैं।"
                }[language]
            });
        }

        // Step 2: Validate input fields
        const nameValidation = NameValidator(name);
        if (!nameValidation.valid) {
            return res.status(400).json({ success: false, message: nameValidation.message[language] });
        }

        const contactValidation = contactValidator(contact);
        if (!contactValidation.valid) {
            return res.status(400).json({ success: false, message: contactValidation.message[language] });
        }

        const locationValidation = locationValidator(location);
        if (!locationValidation.valid) {
            return res.status(400).json({ success: false, message: locationValidation.message[language] });
        }

        // Step 3: Check if a library with the same name already exists
        const existingLibrary = await Library.findOne({ name });
        if (existingLibrary) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "Library with this name already exists",
                    hi: "इस नाम से लाइब्रेरी पहले से मौजूद है"
                }[language]
            });
        }

        // Step 4: Create the new library
        const newLibrary = new Library({
            name,
            contact,
            location
        });

        await newLibrary.save();

        // Step 5: Return success response
        return res.status(201).json({
            success: true,
            message: {
                en: "Library added successfully",
                hi: "लाइब्रेरी सफलतापूर्वक जोड़ी गई"
            }[language],
            library: newLibrary
        });
    } catch (error) {
        // Handle any errors
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while adding the library",
                hi: "लाइब्रेरी जोड़ते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};



const LibraryGet = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { id } = req.params;

        // If an ID is provided, get a specific library
        if (id) {
            const library = await Library.findById(id);
            if (!library) {
                return res.status(404).json({
                    success: false,
                    message: {
                        en: "Library not found",
                        hi: "लाइब्रेरी नहीं मिली"
                    }[language]
                });
            }

            return res.status(200).json({ success: true, library });
        }

        
        const libraries = await Library.find();
        return res.status(200).json({ success: true, libraries });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while retrieving the libraries",
                hi: "लाइब्रेरी प्राप्त करते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};
const LibraryUpdate = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { id } = req.params;
        const { name, contact, location } = req.body;
        const userId = req.userId; //  User's ID stored in the request, typically done via middleware after authentication



                //  Check if the user is a library owner
                const user = await User.findById(userId);
                if (!user.isLibraryOwner) {
                    return res.status(403).json({
                        success: false,
                        message: {
                            en: "You are not authorized to add a library.",
                            hi: "आप लाइब्रेरी जोड़ने के लिए अधिकृत नहीं हैं।"
                        }[language]
                    });
                }

        // Validate inputs
        const nameValidation = NameValidator(name);
        if (!nameValidation.valid) {
            return res.status(400).json({ success: false, message: nameValidation.message[language] });
        }

        const contactValidation = contactValidator(contact);
        if (!contactValidation.valid) {
            return res.status(400).json({ success: false, message: contactValidation.message[language] });
        }

        const locationValidation = locationValidator(location);
        if (!locationValidation.valid) {
            return res.status(400).json({ success: false, message: locationValidation.message[language] });
        }

        // Update the library
        const updatedLibrary = await Library.findByIdAndUpdate(
            id,
            { name, contact, location },
            { new: true, runValidators: true }
        );

        if (!updatedLibrary) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Library not found",
                    hi: "लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        return res.status(200).json({
            success: true,
            message: {
                en: "Library updated successfully",
                hi: "लाइब्रेरी सफलतापूर्वक अपडेट की गई"
            }[language],
            library: updatedLibrary
        });

    } catch (error) {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while updating the library",
                hi: "लाइब्रेरी अपडेट करते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};

const LibraryDelete = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { id } = req.params;

        const userId = req.userId; //  User's ID stored in the request, typically done via middleware after authentication



        //  Check if the user is a library owner
        const user = await User.findById(userId);
        if (!user.isLibraryOwner) {
            return res.status(403).json({
                success: false,
                message: {
                    en: "You are not authorized to delete a library.",
                    hi: "आप लाइब्रेरी को हटाने के लिए अधिकृत नहीं हैं।"
                }[language]
            });
        }


        // Delete the library
        const deletedLibrary = await Library.findByIdAndDelete(id);

        if (!deletedLibrary) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Library not found",
                    hi: "लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        return res.status(200).json({
            success: true,
            message: {
                en: "Library deleted successfully",
                hi: "लाइब्रेरी सफलतापूर्वक हटा दी गई"
            }[language],
            library: deletedLibrary
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while deleting the library",
                hi: "लाइब्रेरी हटाते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};


const getLibraryDetailsById = async (req, res) => {
    try {
        const { id } = req.params;
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

        // Find the library by its ID
        const library = await Library.findById(id);
        if (!library) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Library not found",
                    hi: "लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        // Fetch details for each book in the library's inventory
        const booksWithDetails = await Promise.all(
            library.inventory.map(async (item) => {
                const book = await Book.findById(item.bookid);
                return {
                    title: book ? book.title : item.title,  // Fallback to title in the library inventory
                    publishedDate: book ? book.publishedDate : "Unknown",
                    author: book ? book.author : "Unknown",
                    image: book ? book.image : "No Image",
                    borrower: item.borrower.name || null,  // Borrower details from library's inventory
                    price: item.borrower.price || null
                };
            })
        );

        // Construct the response with library and books details
        const response = {
            library: {
                name: library.name,
                location: library.location,
                contact: library.contact
            },
            books: booksWithDetails
        };

        return res.status(200).json({
            success: true,
            message: {
                en: "Library details retrieved successfully",
                hi: "लाइब्रेरी का विवरण सफलतापूर्वक प्राप्त किया गया"
            }[language],
            data: response
        });

    } catch (error) {
        console.error("Error retrieving library details:", error);
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while retrieving library details",
                hi: "लाइब्रेरी का विवरण प्राप्त करते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};


module.exports ={ LibraryAdd, LibraryDelete,LibraryGet,LibraryUpdate,getLibraryDetailsById
}