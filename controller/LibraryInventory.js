

const Book = require("../models/BookSchema");
const Library = require("../models/LibrarySchema");
const User = require('../models/UserSchema');

const addBookToLibraryInventory = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const libraryId = req.params.id;
        const { title } = req.body;


        const userId = req.userId; //  User's ID stored in the request, typically done via middleware after authentication

        const user = await User.findById(userId);
        console.log(user)
        if (!user.isLibraryOwner) {
            return res.status(403).json({
                success: false,
                message: {
                    en: "You are not authorized to add inventories to library.",
                    hi: "आप लाइब्रेरी में इन्वेंटरी जोड़ने के लिए अधिकृत नहीं हैं।"
                }[language]
            });
        }

        // Find the library by ID
        const library = await Library.findById(libraryId);
        if (!library) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Library not found",
                    hi: "लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        // Find the book by title
        const book = await Book.findOne({ title });
        if (!book) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Book not found in the collection",
                    hi: "पुस्तक संग्रह में नहीं मिली"
                }[language]
            });
        }

         // Check if the book with the same title is already in the library's inventory
         const bookExists = library.inventory.some(item => item.title === title);
         if (bookExists) {
             return res.status(400).json({
                 success: false,
                 message: {
                     en: "Book with this title already exists in the library's inventory",
                     hi: "इस शीर्षक के साथ पुस्तक पहले से ही लाइब्रेरी की इन्वेंट्री में मौजूद है"
                 }[language]
             });
         }

               // Check if the book already belongs to another library
        if (book.libraryName) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "This book is already in another library",
                    hi: "यह पुस्तक पहले से ही किसी अन्य लाइब्रेरी में है"
                }[language]
            });
        }

       

        // Add the book to the library's inventory
        const newInventoryItem = {
            bookid: book._id,
            title: book.title
        };
        console.log("Adding to inventory:", newInventoryItem);

        library.inventory.push(newInventoryItem);
        await library.save();

         // Update the book's library field
         book.libraryName = library.name;
         book.libraryID=library._id
         await book.save();

        return res.status(200).json({
            success: true,
            message: {
                en: "Book added to library's inventory successfully",
                hi: "लाइब्रेरी की इन्वेंट्री में पुस्तक सफलतापूर्वक जोड़ी गई"
            }[language],

        });
    } catch (error) {
        console.error("Error adding book to inventory:", error);
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while adding the book to the inventory",
                hi: "इन्वेंट्री में पुस्तक जोड़ते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};


const getLibraryInventory = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const libraryId = req.params.id;

        // Find the library by ID
        const library = await Library.findById(libraryId);
        if (!library) {
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
            inventory: library.inventory
        });
    } catch (error) {
        console.error("Error fetching library inventory:", error);
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while fetching the library's inventory",
                hi: "लाइब्रेरी की इन्वेंट्री लाते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};



const deleteBookFromLibraryInventory = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { libraryId, bookId } = req.params;

        const userId = req.userId; // User's ID stored in the request, typically done via middleware after authentication

        const user = await User.findById(userId);
        if (!user.isLibraryOwner) {
            return res.status(403).json({
                success: false,
                message: {
                    en: "You are not authorized to delete inventories from the library.",
                    hi: "आप लाइब्रेरी से इन्वेंटरी हटाने के लिए अधिकृत नहीं हैं।"
                }[language]
            });
        }

        // Find the library by ID
        const library = await Library.findById(libraryId);

        if (!library) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Library not found",
                    hi: "लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        // Find and remove the book from the library’s inventory
        const initialLength = library.inventory.length;
        library.inventory = library.inventory.filter(item => item.bookid.toString() !== bookId);

        if (library.inventory.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Book not found in the library's inventory",
                    hi: "लाइब्रेरी की इन्वेंट्री में पुस्तक नहीं मिली"
                }[language]
            });
        }

        // Save the updated library inventory
        await library.save();

        // Remove the library field from the book document
        const book = await Book.findById(bookId);
        if (book) {
            book.libraryName = null;
            await book.save();
        }

        return res.status(200).json({
            success: true,
            message: {
                en: "Book removed from library's inventory successfully",
                hi: "लाइब्रेरी की इन्वेंट्री से पुस्तक सफलतापूर्वक हटा दी गई"
            }[language],
            inventoryRemaining: library.inventory
        });
    } catch (error) {
        console.error("Error removing book from inventory:", error);
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while removing the book from the inventory",
                hi: "इन्वेंट्री से पुस्तक हटाते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};




module.exports = {
    addBookToLibraryInventory,
    getLibraryInventory,
    deleteBookFromLibraryInventory
};
