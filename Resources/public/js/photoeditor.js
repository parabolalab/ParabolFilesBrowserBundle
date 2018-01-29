"use strict"
	
let map = new WeakMap();

let privateProp = function (object) {
    if (!map.has(object))
        map.set(object, {});
    return map.get(object);
}


class PhotoEditor {
	constructor(wrapperSelector, { 
									id = 'photoEditor', 
									barTemplate = '<div class="photoeditor-bar"></div>', 
									buttonTemplate = '<i class="photoeditor-btn fa"></i>',
									imageContainerTemplate = '<div class="image-container"></div>', 
									preloader = '<i class="fa fa-cog fa-spin fa-2x fa-fw spin-loader" i></i>', 
									closeBtnTemplate = '<div class="btn-close"><i class="fa fa-times-circle fa-lg"></i></div>', 
									contextName = 'filebrowser', 
									saveUrl = null,
									closeAfterSave = true,
									buttons = ['move', 'crop', 'resize', 'zoomOut', 'zoomIn', 'rotateLeft', 'rotateRight', 'flipHorizontal', 'flipVertical', 'save'],
									buttonsClass = {},
									pushableButtons = [],
									disabledButtons = [],
									cropperOptions = {},
									preShow = (photoEditor) => { console.log('preShow') },
									postShow = (photoEditor) => { console.log('postShow') },
									preSave = (photoEditor, formData) => { console.log('preSave') },
									postSave = (photoEditor, data) => { console.log('postSave') }
								} = {}
	){

		this.buttons = buttons
		this.disabledButtons = disabledButtons
		this.pushableButtons = ['move', 'crop'].concat(pushableButtons)
		this.cropperOptions = Object.assign(
			{
				dragMode: 'crop', 
				crop: function(e) {
					this.getContainer().find('.stats').html(parseInt(e.detail.width) + 'px x ' + parseInt(e.detail.height) + 'px');
				}.bind(this)
			}, cropperOptions
		)
		this.buttonsClass = Object.assign({
			 'move': 'fa-arrows' ,
			 'crop': 'fa-crop' ,
			 'resize': 'fa-arrows-alt' ,
			 'zoomOut': 'fa-search-minus' ,
			 'zoomIn': 'fa-search-plus' ,
			 'rotateLeft': 'fa-undo' ,
			 'rotateRight': 'fa-repeat' ,
			 'flipHorizontal': 'fa-arrows-h' ,
			 'flipVertical': 'fa-arrows-v' ,
			 'save': 'fa-save' 
		}, buttonsClass)
		this.preloader = preloader
		this.closeBtnTemplate = closeBtnTemplate
		this.barTemplate = barTemplate
		this.buttonTemplate = buttonTemplate
		this.imageContainerTemplate = imageContainerTemplate
		this.closeAfterSave = closeAfterSave
		
		this.preShow = preShow
		this.postShow = postShow
		this.preSave = preSave
		this.postSave = postSave

		privateProp(this).id = id
		privateProp(this).contextName = contextName
		privateProp(this).wrapper = $(wrapperSelector)
		privateProp(this).image = null
		privateProp(this).saveUrl = saveUrl
		privateProp(this).lockCKEditor = false

		this.buildView();

		return this
	}

	isCKEditorUnlocked()
	{
		return !privateProp(this).lockCKEditor
	}

	lockCKEditor()
	{
		privateProp(this).lockCKEditor = true
	}

	unlockCKEditor()
	{
		privateProp(this).lockCKEditor = false
	}

	getContextName()
	{
		return privateProp(this).contextName
	}

	getSaveUrl()
	{
		return privateProp(this).saveUrl
	}

	getImage()
	{
		return document.getElementById('image')
	}

	getContainer()
	{
		return $('#' + privateProp(this).id);
	}

	getCropper()
	{
		return this.cropper
	}

	getBtn(action)
	{
		return this.getContainer().find(`[data-photoeditor-action='${action}']`)
	}

	buildView()
	{
		privateProp(this).wrapper.html(
			`<div id="${privateProp(this).id}">
				${this.preloader}
				${this.closeBtnTemplate}
				<div class="stats"></div>
				${this.imageContainerTemplate}
			</div>`)

		privateProp(this).wrapper.find(`#${privateProp(this).id}`).append(this.createButtonBar())

		this.assignEvents()
	}


	createButton(buttonName)
	{
		let $btn = null

		if(this.disabledButtons.indexOf(buttonName) === -1)
		{
			$btn = $(this.buttonTemplate)
			if(typeof this.buttonsClass[buttonName] == 'string') $btn.addClass(this.buttonsClass[buttonName])
			$btn.data('photoeditorAction', buttonName)
			if(this.pushableButtons.indexOf(buttonName) !== -1)
			{
				if( typeof this.cropperOptions.dragMode == 'string' && this.cropperOptions.dragMode == buttonName) $btn.addClass('active')
				$btn.data('pushable', true)
			}
			return $btn[0]
		}
		else return $btn

	}

	createButtonBar()
	{
		let $bar = $(this.barTemplate)

		for (let button of this.buttons)
		{
			// console.log(this.createButton(button))
			$bar.append(this.createButton(button))
		}
		return $bar[0]
	}

	assignEvents()
	{
		this.getContainer().find('.btn-close').click((e) => {
			this.close()
		})

		this.getContainer().find('.photoeditor-bar > .photoeditor-btn').click((e) => {
			
			let action = $(e.target).data('photoeditorAction')
			if(typeof this[action] == 'function')
			{
				this[action](e)
				if($(e.target).data('pushable'))
				{
					$('.photoeditor-bar > .photoeditor-btn.active').removeClass('active')
					$(e.target).addClass('active')
				}
			} 
			else console.error(`PhotoEditor "${action}" action not exists.`)
		})

	}

	showPreloader()
	{
		this.getContainer().find('.spin-loader').fadeIn()
	}

	hidePreloader()
	{
		this.getContainer().find('.spin-loader').fadeOut()
	}

	show(imageSrc)
	{
		this.preShow(this)

		let container =  this.getContainer();
		container.css({top: -$(window).height(), display: 'block'}).animate({'top': 0})
				

		if(imageSrc)
		{
			this.loadImage(imageSrc, (image) => {
				
				this.cropper = new Cropper(image, this.cropperOptions)

				image.addEventListener('ready', function () {

					let $cropperContainer = this.getContainer().find('.image-container > .cropper-container');
					$cropperContainer.css({
						// 'margin-left': this.getContainer().width() > $cropperContainer.width() ? (this.getContainer().width() - $cropperContainer.width()) / 2 : 0,
						'margin-top': this.getContainer().height() > $cropperContainer.height() ? (this.getContainer().height() - $cropperContainer.height()) / 2 : 0
					})
					this.postShow(this)

				}.bind(this))
			})
		}
		else
		{
			this.postShow(this)
		}
	}

	loadImage(imageSrc, callback)
	{
		this.showPreloader()

		let image = new Image
		image.onload = () => { 
				$('.image-container').html(`<img style="opacity: 0;" id="image" src="${image.src}" />`)
				this.hidePreloader()
				callback(this.getImage())
		}
		image.src = imageSrc;
	}

	close()
	{
		// $('#cropperResizeImage').modal('hide')
		this.getContainer().animate({'top': -$(window).height() }, () => {
			this.getImage().src = '';
			if(this.getCropper()) this.getCropper().destroy()
		})
		
		this.unlockCKEditor()
	}

	move(e)
	{
		this.getCropper().setDragMode('move');
	}
	
	crop(e)
	{
		this.getCropper().setDragMode('crop');
	}

	resize(e)
	{
		alert('resize');
			// $('#cropperResizeImage input[name=id]').val($parabolFileBrowserCurrent.data('id'));
			// $('#cropperResizeImage input[name=width]').val($parabolFileBrowserCurrent.data('width'));
			// $('#cropperResizeImage input[name=height]').val($parabolFileBrowserCurrent.data('height'));
			// defaultScale = $parabolFileBrowserCurrent.data('width') / $parabolFileBrowserCurrent.data('height')
			// if(iCheckProp)
			// {
			// 	$('#cropperResizeImage input[name=proportion]').iCheck('check')
			// 	$('#cropperResizeImage input[name=override]').iCheck('check')
			// } 
			// else
			// {
			// 	$('#cropperResizeImage input[name=proportion]').attr('checked', true)
			// 	$('#cropperResizeImage input[name=override]').attr('checked', true)
			// } 
			// $('#cropperResizeImage').modal({backdrop: false})
	}


	zoomOut(e){
		this.getCropper().zoom(0.1)
	}
	
	zoomIn (e){
		this.getCropper().zoom(-0.1)
	}

	rotateRight (e){
		this.getCropper().rotate(10)
	}
	
	rotateLeft (e){
		this.getCropper().rotate(-10)
	}

	flipVertical(e){
		this.getCropper().scaleY(this.getCropper().getImageData().scaleY * -1)
	}
	
	flipHorizontal(e){
		this.getCropper().scaleX(this.getCropper().getImageData().scaleX * -1)
	}

	save(e){
		
		if(this.getSaveUrl())
		{
			this.showPreloader()
			this.getCropper().getCroppedCanvas().toBlob(function (blob) {
				let filename = new String(this.getImage().src).replace(/.*\//g, '').replace(/(\.[\w]+)$/, '-'+parseInt(this.getCropper().getCropBoxData().width)+'x'+parseInt(this.getCropper().getCropBoxData().height) + '$1');
				let formData = new FormData();
				formData.append('context', this.getContextName())
				formData.append( this.getContextName() +  '[]', blob, filename)

				this.preSave(this, formData);

				$.ajax(this.getSaveUrl(), {
					method: "POST",
					data: formData,
					processData: false,
					contentType: false,
					dataType: 'json',
					success: function (data) {
						this.hidePreloader()
						this.postSave(this, data);
						if(this.closeAfterSave) this.close()
					}.bind(this),
					error: function () {
					  console.log('Upload error');
					}.bind(this)
				});
			}.bind(this));
		}
		else {
			alert('Add saveUrl option to allow save action execution.')
		}
		
	}
}

var pe;
// (function($){
// 	$(document).ready(function(){

// 	// pe = new PhotoEditor('body', {
// 	// 	// disabledButtons: ['zoomOut', 'zoomIn']
// 	// 	// 
// 	// 		saveUrl: 'http://dev/devs/bundles/ParabolFilesBrowserBundle/Resources/public/js/upload.json',
// 	// 		closeAfterSave: false
// 	// 	// 	preSave: function(photoEditor, formData){
// 	// 	// 		formData.append('test', 'dev')
// 	// 	// }
// 	// })
// 	// pe.show('bridge.jpg')

// 	})
// })(jQuery)


