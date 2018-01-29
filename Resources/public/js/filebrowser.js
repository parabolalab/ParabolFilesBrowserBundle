"use strict"

class CKEditorFileBrowser 
{
	constructor({maxPerPage = 25, actions = {}, createThumb = null } = {})
	{
		if(typeof createThumb === 'function') this.createThumb = createThumb

		this.maxPerPage = maxPerPage
		this._ckeditorLocked = true
		this.actions = actions
		let fileInput = document.querySelector('#filebrowser-fileuploadInput')
		this.order = fileInput && fileInput.dataset.order ? fileInput.dataset.order : 'desc'
		this.addListeners()
	}

	lockCkEditor()
	{
		this._ckeditorLocked = true
	}

	unlockCkEditor()
	{
		this._ckeditorLocked = false
	}

	isCkEditorLocked()
	{
		return this._ckeditorLocked;
	}

	closest(element, tag){
		let e = element
		do
		{
			e = e.parentEent
		}
		while(!(e === null || e.localName === tag));
		return e
	}


	addListeners()
	{
		let thumbs = this.getAllContainers()
		for(let thumb of thumbs)
		{
			thumb.addEventListener('click', (e) => {
				e.preventDefault()
				e.stopPropagation()
				this.addFileToCkeditor(e.target)
				// this.
			})

			let a = thumb.querySelector('button')
			if(a) a.addEventListener('click', (e) => {
				e.preventDefault()
				e.stopPropagation()
				this.callAction(e.target)
			})
		}
	}

	getAllContainers()
	{
		return document.querySelector('.file-list ul.files').children
	}

	callAction(button)
	{
		if(button.dataset.action)
		{
			if(typeof this.actions[button.dataset.action] === 'function')
			{
				this.actions[button.dataset.action].call(this, button)
			}
			else if(typeof this[button.dataset.action] === 'function')
			{
				this[button.dataset.action](button)
			}
		}
	}

	removeFile(button)
	{
		let thumb = this.closest(button, 'li')
		if(button.dataset.url && thumb)
		{
			this.lockCkEditor()

			let httpRequest = new XMLHttpRequest()
			httpRequest.open('GET', button.dataset.url, true);

			httpRequest.onload = function () {
				// let response = JSON.parse(httpRequest.response)
				if(httpRequest.status === 200)
				{
					thumb.remove()
				}
  				this.unlockCkEditor()
			}.bind(this);

			httpRequest.send()

		}
	}

	createThumb(data)
	{
    	return tmpl('template-download', data)
	}

    addThumb(data)
	{
		let thumb = this.createThumb(data)
		document.querySelector('.file-list ul.files').insertBefore(thumb, this.order === 'desc' ? document.querySelector('.file-list ul.files > li:first-child') : null);
		this.fixThumbView()
	}

    fixThumbView()
	{
		if(document.querySelectorAll('.file-list ul.files > li').length > this.maxPerPage)
		{
			document.querySelector('.file-list ul.files > li:' + (this.order == 'desc' ? 'last' : 'first') + '-child').remove();	
		} 
	}

	getUrlParam( paramName ) {
            let reParam = new RegExp( '(?:[\?&]|&)' + paramName + '=([^&]+)', 'i' );
            let match = window.location.search.match( reParam );
            return ( match && match.length > 1 ) ? match[1] : null;
    }

	addFileToCkeditor(thumb)
	{
		if(thumb.dataset.file)
		{
			window.opener.CKEDITOR.tools.callFunction( this.getUrlParam( 'CKEditorFuncNum' ), thumb.dataset.file );
			window.close()
		}
	}

}



