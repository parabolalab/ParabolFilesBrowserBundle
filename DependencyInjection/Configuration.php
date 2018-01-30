<?php

namespace Parabol\FilesBrowserBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * This is the class that validates and merges configuration from your app/config files.
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/configuration.html}
 */
class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritdoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('parabol_files_browser');

        $rootNode
            ->children()
                ->scalarNode('files_type')->defaultValue('Parabol\FilesUploadBundle\Form\Type\BlueimpType')->end()
                ->scalarNode('files_action')->defaultValue('ParabolFileAdminBundle:File\\List:browser')->end()
                ->scalarNode('thumb_onclick')->defaultValue('addFileToCkeditor(this)')->end()
                ->scalarNode('browser_template')->defaultValue('ParabolFilesBrowserBundle::browser.html.twig')->end()
                ->scalarNode('layout_template')->defaultValue('ParabolAdminCoreBundle::base_admin_uncompressed.html.twig')->end()
                ->scalarNode('loader_css_class')->defaultValue('loader')->end() //for admin generator spin-loader
            ->end()
        ->end();

        return $treeBuilder;
    }
}
