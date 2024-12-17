<?php
/*
Template Name: Kioskeys Template
*/

get_header(); ?>

<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1><?php the_title(); ?></h1>
      <?php if (get_field('hero_subtitle')): ?>
        <p><?php echo get_field('hero_subtitle'); ?></p>
      <?php endif; ?>
    </div>
  </section>

  <!-- Main Content -->
  <section class="main-content">
    <div class="content-container">
      <?php the_content(); ?>
      
      <?php if (is_page('como-funciona')): ?>
        <!-- Pasos -->
        <?php if (have_rows('steps')): ?>
          <?php while (have_rows('steps')): the_row(); ?>
            <div class="step-card">
              <div class="step-number"><?php echo str_pad(get_row_index(), 2, '0', STR_PAD_LEFT); ?></div>
              <h3><?php the_sub_field('title'); ?></h3>
              <p><?php the_sub_field('description'); ?></p>
            </div>
          <?php endwhile; ?>
        <?php endif; ?>

        <!-- Beneficios -->
        <?php if (have_rows('benefits')): ?>
          <div class="benefits-grid">
            <?php while (have_rows('benefits')): the_row(); ?>
              <div class="benefit-card">
                <i class="fas <?php the_sub_field('icon'); ?> benefit-icon"></i>
                <h3><?php the_sub_field('title'); ?></h3>
                <p><?php the_sub_field('description'); ?></p>
              </div>
            <?php endwhile; ?>
          </div>
        <?php endif; ?>
      <?php endif; ?>
    </div>
  </section>
</main>

<?php get_footer(); ?>