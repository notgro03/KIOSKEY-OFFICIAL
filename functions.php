// Agregar al functions.php de tu tema

function kioskeys_enqueue_styles() {
    wp_enqueue_style('fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
    wp_enqueue_style('kioskeys-styles', get_template_directory_uri() . '/css/kioskeys-styles.css', array(), '1.0.0');
    wp_enqueue_script('kioskeys-scripts', get_template_directory_uri() . '/js/kioskeys-scripts.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'kioskeys_enqueue_styles');

// Agregar soporte para campos personalizados
if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
        'key' => 'group_kioskeys',
        'title' => 'Kioskeys Fields',
        'fields' => array(
            array(
                'key' => 'field_hero_subtitle',
                'label' => 'Hero Subtitle',
                'name' => 'hero_subtitle',
                'type' => 'text',
            ),
            array(
                'key' => 'field_steps',
                'label' => 'Steps',
                'name' => 'steps',
                'type' => 'repeater',
                'sub_fields' => array(
                    array(
                        'key' => 'field_step_title',
                        'label' => 'Title',
                        'name' => 'title',
                        'type' => 'text',
                    ),
                    array(
                        'key' => 'field_step_description',
                        'label' => 'Description',
                        'name' => 'description',
                        'type' => 'textarea',
                    ),
                ),
            ),
            array(
                'key' => 'field_benefits',
                'label' => 'Benefits',
                'name' => 'benefits',
                'type' => 'repeater',
                'sub_fields' => array(
                    array(
                        'key' => 'field_benefit_icon',
                        'label' => 'Icon Class',
                        'name' => 'icon',
                        'type' => 'text',
                    ),
                    array(
                        'key' => 'field_benefit_title',
                        'label' => 'Title',
                        'name' => 'title',
                        'type' => 'text',
                    ),
                    array(
                        'key' => 'field_benefit_description',
                        'label' => 'Description',
                        'name' => 'description',
                        'type' => 'textarea',
                    ),
                ),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'page_template',
                    'operator' => '==',
                    'value' => 'kioskeys-template.php',
                ),
            ),
        ),
    ));
}