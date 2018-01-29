<?php

namespace Parabol\FilesBrowserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class BrowserController extends Controller
{
    public function indexAction(Request $request)
    {
 
    	if(!$request->get('width') || !$request->get('height'))
		{
			return new Response("<script>window.location=window.location.href + (window.location.href.indexOf('?') != -1 ? '&' : '?') + 'width=' + window.innerWidth + '&height=' + window.innerHeight</script>");
		}

		$data = [];

		if($this->getParameter('parabol_files_browser.files_type'))
		{

			$form = $this->createFormBuilder()
				->add('filebrowser', $this->getParameter('parabol_files_browser.files_type'), [
					'multiple' => true, 
					'cropper' => true,
					'order' => 'desc', 
					'thumb' => [
						'onclick' => $this->getParameter('parabol_files_browser.thumb_onclick', '')
					],
					'description' => '',
					'label' => ' ',
					])
				->getForm();

			$data['form'] = $form->createView();
		}

		$data['filesAction'] = $this->getParameter('parabol_files_browser.files_action');
		$data['layoutTemplate'] = $this->getParameter('parabol_files_browser.layout_template');

        return $this->render($this->getParameter('parabol_files_browser.browser_template'), $data);

    }


}
