const  mongoose  = require('mongoose');
const Book = require('../models/BookSchema');
const Library = require('../models/LibrarySchema');
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
            return res.status(409).json({
                success: false,
                message: {
                    en: "Library with this name already exists",
                    hi: "इस नाम से लाइब्रेरी पहले से मौजूद है"
                }[language]
            });
        }
        const ownerName=user.name;

        // Step 4: Create the new library
        const newLibrary = new Library({
            name,
            contact,
            location,
            owner:ownerName
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

        // Get all libraries
        const libraries = await Library.find();
        
        if (libraries.length === 0) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "No libraries found",
                    hi: "कोई लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        return res.status(200).json({
            success: true,
            message: {
                en: "Libraries retrieved successfully",
                hi: "लाइब्रेरी सफलतापूर्वक प्राप्त की गईं"
            }[language],
            libraries
        });

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
        const userId = req.userId; // User's ID stored in the request, typically done via middleware after authentication

        // Validate the library ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "Invalid library ID",
                    hi: "अमान्य लाइब्रेरी आईडी"
                }[language]
            });
        }

        // Check if the library exists and get its owner
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

           // Find the user by ID and get their name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "User not found",
                    hi: "उपयोगकर्ता नहीं मिला"
                }[language]
            });
        }
        // Check if the user is the owner of the library
      
        if (library.owner !== user.name) {
            return res.status(403).json({
                success: false,
                message: {
                    en: "You are not authorized to edit this library.",
                    hi: "आप इस लाइब्रेरी को संपादित करने के लिए अधिकृत नहीं हैं।"
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

        // Check if the new library name already exists
        const existingLibrary = await Library.findOne({ name, _id: { $ne: id } });
        if (existingLibrary) {
            return res.status(409).json({
                success: false,
                message: {
                    en: "Library name already exists",
                    hi: "लाइब्रेरी नाम पहले से ही मौजूद है"
                }[language]
            });
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

        // Update libraryName in the Book collection if there are books
        const updateResult = await Book.updateMany(
            { libraryID: id },
            { $set: { libraryName: name } }
        );

    
        return res.status(200).json({
            success: true,
            message: {
                en: "Library updated successfully",
                hi: "लाइब्रेरी सफलतापूर्वक अपडेट की गई"
            }[language],
            library: updatedLibrary
        });

    } catch (error) {
        console.error("Error updating library:", error);
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
        const userId = req.userId; // User's ID stored in the request, typically done via middleware after authentication

        // Validate the library ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "Invalid library ID",
                    hi: "अमान्य लाइब्रेरी आईडी"
                }[language]
            });
        }

        // Find the library by ID
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

        // Find the user by ID and get their name
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "User not found",
                    hi: "उपयोगकर्ता नहीं मिला"
                }[language]
            });
        }

        // Check if the user is the library owner by comparing the name
        if (library.owner !== user.name) {
            return res.status(403).json({
                success: false,
                message: {
                    en: "You are not authorized to delete this library.",
                    hi: "आप इस लाइब्रेरी को हटाने के लिए अधिकृत नहीं हैं।"
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

        // Update the libraryName to null or a default value in the Book collection for books linked to this library
        await Book.updateMany(
            { libraryID: id },
            { $set: { libraryName: null,libraryID: null } } // or set to any default value
        );

        return res.status(200).json({
            success: true,
            message: {
                en: "Library deleted successfully",
                hi: "लाइब्रेरी सफलतापूर्वक हटा दी गई"
            }[language],
            library: deletedLibrary
        });

    } catch (error) {
        console.error("Error deleting library:", error);
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


        // Validate the library ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "Invalid library ID",
                    hi: "अमान्य लाइब्रेरी आईडी"
                }[language]
            });
        }


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


module.exports = {
    LibraryAdd, LibraryDelete, LibraryGet, LibraryUpdate, getLibraryDetailsById
}