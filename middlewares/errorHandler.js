
// This middleware handles errors that asyncHandler does not recognize.

const errorHandler = (err, req, res, next) => {
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500 // server error 

    res.status(status)

    // RTK Query requires isError flag to handle some errors properly.
    res.json({ message: err.message, isError: true })
}

module.exports = errorHandler 