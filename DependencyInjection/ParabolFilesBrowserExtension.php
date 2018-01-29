<?php

namespace Parabol\FilesBrowserBundle\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Loader;

/**
 * This is the class that loads and manages your bundle configuration.
 *
 * @link http://symfony.com/doc/current/cookbook/bundles/extension.html
 */
class ParabolFilesBrowserExtension extends Extension
{
    /**
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $container->setParameter('parabol_files_browser.files_type', $config['files_type']);
        $container->setParameter('parabol_files_browser.thumb_onclick', $config['thumb_onclick']);      
        $container->setParameter('parabol_files_browser.files_action', $config['files_action']);
        $container->setParameter('parabol_files_browser.browser_template', $config['browser_template']);   
        $container->setParameter('parabol_files_browser.layout_template', $config['layout_template']); 
        $container->setParameter('parabol_files_browser.loader_css_class', $config['loader_css_class']);

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('services.yml');
    }
}
