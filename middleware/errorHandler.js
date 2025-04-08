const errorHandler = (err, req, res, next) => {
    console.log(err);

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: err.errors[0].message });
    }
}

module.exports = errorHandler;