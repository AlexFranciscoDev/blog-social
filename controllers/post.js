const testPost = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'Post controller'
    })
}

module.exports = {
    testPost
}