
const crypto = require('crypto');
const storage =require('../firebase/firebaseconfig')
const Book = require('../models/BookSchema');
const User = require('../models/UserSchema');
const moment = require('moment');
const Library = require('../models/LibrarySchema');
const  mongoose  = require('mongoose');

// Function to hash file buffer
const hashFileBuffer = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

// Function to validate date
const isValidDate = (dateString) => {
    const normalizedDate = dateString.replace(/\b(\d)\b/g, '0$1');
    return moment(normalizedDate, 'YYYY-MM-DD', true).isValid();
};


// adding a new book to the collection
const addBook = async (req, res) => {
    const userId = req.userId;
    // Check the language header; default to English ('en') if not provided
    const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

    try {
        //  Check if the user is an author
        const user = await User.findById(userId);
        if (!user || !user.isAuthor) {
            return res.status(403).json({
                message: {
                    hi: "केवल लेखक ही किताबें जोड़ सकते हैं।",
                    en: "Only authors are allowed to add books."
                }[language]
            });
        }


        
        const { title, publishedDate } = req.body;
        const file = req.file;

        if (!title || !publishedDate || !file) {
            return res.status(400).json({
                message: {
                    hi: "कृपया सभी आवश्यक फ़ील्ड प्रदान करें।",
                    en: "Please provide all required fields."
                }[language]
            });
        }

        // Check if title is already taken
        const existingBook = await Book.findOne({ title });
        if (existingBook) {
            return res.status(409).json({
                message: {
                    hi: "शीर्षक पहले से ही मौजूद है।",
                    en: "Title already exists."
                }[language]
            });
        }

        // Validate publishedDate
        if (!isValidDate(publishedDate)) {
            return res.status(400).json({
                message: {
                    hi: "अवैध तिथि प्रारूप।",
                    en: "Invalid date format."
                }[language]
            });
        }

        // Convert publishedDate to a Date object
        const date = moment(publishedDate, 'YYYY-MM-DD').startOf('day').toDate();
        console.log(date);
        if (date > new Date()) {
            return res.status(400).json({
                message: {
                    hi: "प्रकाशित तिथि भविष्य में नहीं होनी चाहिए।",
                    en: "Published date cannot be in the future."
                }[language]
            });
        }

        //  Generate a hash for the file buffer
        const fileHash = hashFileBuffer(file.buffer);
        const fileName = `${fileHash}-${file.originalname}`;
        const fileRef = storage.file(`bookCovers/${fileName}`);


        // Check if the file with the same hash already exists
        const [exists] = await fileRef.exists();
        if (exists) {
            return res.status(409).json({
                message: {
                    hi: "इस नाम से एक छवि पहले से ही मौजूद है।",
                    en: "An image with this file name already exists."
                }[language]
            });
        }

        //  Upload the book cover image to Firebase
        await fileRef.save(file.buffer, {
            contentType: file.mimetype,
        });

        const imageUrl = `https://storage.googleapis.com/${storage.name}/bookCovers/${fileName}`;

        //  Create a new book with the image URL as a reference
        const newBook = new Book({
            title,
            publishedDate, // Store the date as a Date object
            author: user.name,
            image: imageUrl, // Store the reference to the Firebase image
        });

        //  Save the book to the database
        await newBook.save();
        return res.status(201).json({
            message: {
                hi: "किताब सफलतापूर्वक जोड़ी गई!",
                en: "Book added successfully!"
            }[language],
            book: newBook
        });
    } catch (error) {
        console.error("Error adding book:", error);
        return res.status(500).json({
            message: {
                hi: "किताब जोड़ने में विफल रहा।",
                en: "Failed to add the book.",
            }[language],
            error: error.message
        });
    }
};

// getting all the books present in the collection
const getAllBooks = async (req, res) => {
    const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

    try {
        const books = await Book.find({});

        // Check if no books are found
        if (books.length === 0) {
            return res.status(404).json({
                message: {
                    hi: "कोई किताबें नहीं मिलीं।",
                    en: "No books found."
                }[language],
            });
        }
       // returning the list of books stored in the database
        return res.status(200).json({
            message: {
                hi: "किताबें सफलतापूर्वक प्राप्त की गईं!",
                en: "Books retrieved successfully!"
            }[language],
            books,
        });
    } catch (error) {
        console.error("Error retrieving books:", error);
        return res.status(500).json({
            message: {
                hi: "किताबें प्राप्त करने में विफल।",
                en: "Failed to retrieve books."
            }[language],
            error: error.message,
        });
    }
};



const updateBookById = async (req, res) => {
    const userId=req.userId
    const { id } = req.params;
    const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: {
                en: "Invalid book ID",
                hi: "अमान्य पुस्तक आईडी"
            }[language]
        });
    }

    try {

         // Validate the book ID
         const book = await Book.findById(id);

         if (!book) {
            return res.status(404).json({
                message: {hi: "किताब नहीं मिली।" ,
                    en: "Book not found."}[language]
            });
        }
        
 

          // Check if the user is the author of the book
          const author = await User.findById(userId);
          console.log(author);
          if (!author || book.author !== author.name) {
              return res.status(403).json({
                  success: false,
                  message: {
                      hi: "केवल लेखक ही किताबें अपडेट कर सकते हैं।",
                      en: "Only the author can update this book."
                  }[language]
              });
          }

        //    if (!book) {
        //      return res.status(404).json({
        //          message: {hi: "किताब नहीं मिली।" ,
        //              en: "Book not found."}[language]
        //      });
        //  }
 
        const { title, publishedDate } = req.body;
        const file = req.file;

       
        // Step 1: Update the title if provided
        if (title) {
            const existingBook = await Book.findOne({ title, _id: { $ne: id } });
            if (existingBook) {
                return res.status(409).json({
                    message: {hi:  "शीर्षक पहले से ही मौजूद है।",
                        en : "Title already exists."}[language],
                });
            }
            book.title = title;
        }

        // Step 2: Update the publishedDate if provided
        if (publishedDate) {
            if (!isValidDate(publishedDate)) {
                return res.status(400).json({
                    message: { hi:  "अवैध तिथि प्रारूप।",
                        en : "Invalid date format."}[language],
                });
            }

            const date = moment(publishedDate, 'YYYY-MM-DD').startOf('day').toDate();
            if (date > new Date()) {
                return res.status(400).json({
                    message:  {hi: "प्रकाशित तिथि भविष्य में नहीं होनी चाहिए।" ,
                        en: "Published date cannot be in the future."}[language],
                });
            }
            book.publishedDate = date;
        }
        if (file) {
            // Check if there is an existing image and delete it from Firebase
            if (book.image) {
                // Extract the filename from the full URL
                const oldFilePath = book.image.split('bookCovers/')[1];
                const oldFileRef = storage.file(`bookCovers/${oldFilePath}`);
        
                try {
                    // Delete the old image from Firebase
                    await oldFileRef.delete();
                } catch (err) {
                    console.warn(`Failed to delete old image: ${err.message}`);
                }
            }
        
            // Generate a hash for the new file buffer
            const fileHash = hashFileBuffer(file.buffer);
            const fileName = `${fileHash}-${file.originalname}`;
            const fileRef = storage.file(`bookCovers/${fileName}`);
        
           
            // Upload the new image to Firebase
            await fileRef.save(file.buffer, {
                contentType: file.mimetype,
            });
        
            // Update the book's image URL
            const imageUrl = `https://storage.googleapis.com/${storage.name}/bookCovers/${fileName}`;
            book.image = imageUrl;
        }
        
      

        // Save the updated book to the database
        await book.save();


        // Try to find the library that contains the book and update the title in its inventory, if exists
        await Library.findOneAndUpdate(
            { "inventory.bookid": id },
            { $set: { "inventory.$.title": title } }, // Update only the title of the book in the inventory
            { new: true }
        );
        return res.status(200).json({
        message: {hi : "किताब सफलतापूर्वक अपडेट की गई!" ,
            en: "Book updated successfully!"}[language],
            book,
        });
    } catch (error) {
        console.error("Error updating book:", error);
        return res.status(500).json({
            message: {'hi' : "किताब को अपडेट करने में विफल।",
                en : "Failed to update the book."}[language],
            error: error.message,
        });
    }
};






const deleteBookById = async (req, res) => {
    const userId=req.userId;
    const { id } = req.params;
    const language = req.headers['language'] === 'hi' ? 'hi' : 'en';

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: {
                    hi: "अमान्य किताब आईडी।",
                    en: "Invalid book ID."
                }[language]
            });}
          
          const user = await User.findById(userId);
       
  
        // Step 1: Validate the book ID
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                message: {hi : "किताब नहीं मिली।",
                    en : "Book not found."}[language],
            });
        }
        
     // Ensure the user is the author of the book
     if (book.author !== user.name) {
        return res.status(403).json({
            message: {
                hi: "आप केवल अपनी किताबों को हटा सकते हैं।",
                en: "You can only delete your own books."
            }[language]
        });
    }


    // Step 5: Check if the book is in a library inventory and remove it from there
    const library = await Library.findOne({ "inventory.bookid": id });
    if (library) {
        // Remove the book from the library's inventory
        await Library.updateOne(
            { _id: library._id },
            { $pull: { inventory: { bookid: id } } }
        );
    }

        // Step 2: Check if the book has an associated image
        if (book.image) {
            // Extract the filename from the full image URL
            const filePath = book.image.split('bookCovers/')[1];
            const fileRef = storage.file(`bookCovers/${filePath}`);

            try {
                // Delete the image from Firebase
                await fileRef.delete();
                console.log('Image deleted successfully.');
            } catch (err) {
                console.warn(`Failed to delete image: ${err.message}`);
                return res.status(500).json({
                    message: {hi:  "किताब की छवि को हटाने में विफल।",
                        en : "Failed to delete the book image."}[language],
                    error: err.message,
                });
            }
        }

        // Step 3: Delete the book document from the database
        await Book.findByIdAndDelete(id);

        return res.status(200).json({
            message: { hi:  "किताब सफलतापूर्वक हटाई गई।",en : "Book deleted successfully."}[language],
        });
    } catch (error) {
        console.error("Error deleting book:", error);
        return res.status(500).json({
            message: {hi: "किताब को हटाने में विफल।",
                en : "Failed to delete the book."}[language],
            error: error.message,
        });
    }
};


const getBookDetailsById = async (req, res) => {
    try {
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        const { id } = req.params;

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: {
                    en: "Invalid book ID",
                    hi: "अमान्य पुस्तक आईडी"
                }[language]
            });
        }

        // Find the book by its ID
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

        // If the book has a library reference, find the full library details
        let libraryDetails = null;
        if (book.libraryName) {
            const library = await Library.findOne({name:book.libraryName});
            if (library) {
                libraryDetails = {
                    name: library.name,
                    location: library.location,
                    contact: library.contact,
                };
            }
        }

        // Construct the response with book details, author, borrower, and library
        const response = {
            title: book.title,
            publishedDate: book.publishedDate,
            author: book.author,
            image: book.image,
            borrower: book.borrower,  // Borrower name (if any)
            library: libraryDetails,  // Full library details (if any)
        };

        return res.status(200).json({
            success: true,
            message: {
                en: "Book details retrieved successfully",
                hi: "पुस्तक का विवरण सफलतापूर्वक प्राप्त किया गया"
            }[language],
            data: response
        });

    } catch (error) {
        console.error("Error retrieving book details:", error);
        const language = req.headers['language'] === 'hi' ? 'hi' : 'en';
        return res.status(500).json({
            success: false,
            message: {
                en: "An error occurred while retrieving book details",
                hi: "पुस्तक का विवरण प्राप्त करते समय एक त्रुटि हुई"
            }[language],
            error: error.message
        });
    }
};



module.exports = {
    addBook,
    getAllBooks,
    updateBookById,
    deleteBookById,
    getBookDetailsById
};
