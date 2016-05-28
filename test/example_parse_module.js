function onCommitContent(text) {
	//console.log('PARSING COMMIT CONTENT')
	return text.replace(/[^\d]/g, '')
}

function onShaContent(text) {
	//console.log('PARSING SHA CONTENT')
	return text.replace(/[^[a-zA-Z0-9]{2,}/g, '')
}

module.exports.commit = onCommitContent
module.exports.sha = onShaContent
