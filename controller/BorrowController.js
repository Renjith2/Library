const   mongoose  = require("mongoose");
const Book = require("../models/BookSchema");
const Library = require("../models/LibrarySchema");
const User = require('../models/UserSchema');

const borrowBookFromLibrary = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { libraryName, bookTitle, price } = req.body;
        const userId = req.userId; // User's ID stored in the request from middleware

        // Find the user by ID to get the borrower's name
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

        // Find the book in the Books collection
        const book = await Book.findOne({ title: bookTitle });
        if (!book) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Book not found in the collection",
                    hi: "संग्रह में पुस्तक नहीं मिली"
                }[language]
            });
        }

        // Find the library by its name
        const library = await Library.findOne({ name: libraryName });
        if (!library) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Library not found",
                    hi: "लाइब्रेरी नहीं मिली"
                }[language]
            });
        }

        // Debugging: Log the inventory and book title
        console.log("Library Inventory:", library.inventory);
        console.log("Requested Book Title:", bookTitle);

        // Normalize book titles to avoid case mismatches
        const normalizedBookTitle = bookTitle.toLowerCase();

        // Find the book in the library's inventory by its title (case-insensitive)
        const bookInLibrary = library.inventory.find(item => 
            item.title.toLowerCase() === normalizedBookTitle 
        );

        // Check if the book is found and available
        if (!bookInLibrary) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Book not available for borrowing",
                    hi: "पुस्तक उधार लेने के लिए उपलब्ध नहीं है"
                }[language]
            });
        }

        // Check if the book is already borrowed
        if (book.borrower) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "Book is already borrowed",
                    hi: "पुस्तक पहले से ही उधार ली गई है"
                }[language]
            });
        }

        // Update the inventory to mark the book as borrowed
        bookInLibrary.available = false;
        bookInLibrary.borrower = {
            name: user.name,  // Save the user's name as borrower
            price: price
        };

        // Save updated library
        await library.save();

        // Update the book in the Book collection to reflect the borrower info
        book.borrower = user.name;  // Update borrower name in Book schema
        await book.save();

        return res.status(200).json({
            success: true,
            message: {
                en: "Book borrowed successfully",
                hi: "पुस्तक सफलतापूर्वक उधार ली गई"
            }[language]
        });

    } catch (error) {
        console.error("Error borrowing book:", error);
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while borrowing the book",
                hi: "पुस्तक उधार लेते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};


const returnBorrowedBook = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { id } = req.params; // Book ID passed in the request URL

        // Find the book in the Book collection by its ID
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Book not found",
                    hi: "पुस्तक नहीं मिली"
                }[language]
            });
        }

        // Find the library that has this book in its inventory
        const library = await Library.findOne({
            'inventory.bookid': id,
            'inventory.available': false  // Only find if the book is currently borrowed
        });

        if (!library) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Borrowed book not found in any library",
                    hi: "उधार ली गई पुस्तक किसी भी लाइब्रेरी में नहीं मिली"
                }[language]
            });
        }

        // Find the book in the library's inventory and update it
        const bookInLibrary = library.inventory.find(item => item.bookid.toString() === id);
        if (!bookInLibrary) {
            return res.status(404).json({
                success: false,
                message: {
                    en: "Book not found in library inventory",
                    hi: "लाइब्रेरी इन्वेंटरी में पुस्तक नहीं मिली"
                }[language]
            });
        }

        // Update the book in the library's inventory to mark it as available
        bookInLibrary.available = true;
        bookInLibrary.borrower = { name: null, price: null };  // Clear borrower info
        await library.save();

        // Update the book in the Book collection to clear the borrower info
        book.borrower = null;
        await book.save();

        return res.status(200).json({
            success: true,
            message: {
                en: "Book returned successfully",
                hi: "पुस्तक सफलतापूर्वक लौटाई गई"
            }[language]
        });

    } catch (error) {
        console.error("Error returning book:", error);
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while returning the book",
                hi: "पुस्तक लौटाते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};







module.exports = {
    borrowBookFromLibrary,
    returnBorrowedBook
};


