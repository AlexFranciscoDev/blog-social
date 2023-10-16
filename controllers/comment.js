const testComment = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'test de comment'
    })
}

module.exports = {
    testComment
}