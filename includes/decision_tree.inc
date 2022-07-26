<?php

use Drupal\Core\Url;

function _convivial_bootstrap_answer(&$variables) {
  $paragraph = $variables['paragraph'];
  $parent_id = !$paragraph->get('parent_id')->isEmpty()
    ? $paragraph->get('parent_id')->value : NULL;
  $answer_key = !$paragraph->get('field_answer_key')->isEmpty()
    ? $paragraph->get('field_answer_key')->value : NULL;
  $answer_label = !$paragraph->get('field_answer_label')->isEmpty()
    ? $paragraph->get('field_answer_label')->value : NULL;
  $answer_step_id = !$paragraph->get('field_answer_step')->isEmpty()
    ? $paragraph->get('field_answer_step')->first()->target_id : NULL;
  $path_step = !$paragraph->get('parent_id')->isEmpty()
    ? Url::fromRoute('entity.node.canonical', ['node' => $parent_id])
      ->toString() : NULL;
  $path_answer = !$paragraph->get('parent_id')->isEmpty()
    ? Url::fromRoute('entity.node.canonical', ['node' => $parent_id])
      ->toString() . '/' . $answer_key : NULL;

  // Set variables.
  $variables['answer']['key'] = $answer_key;
  $variables['answer']['label'] = $answer_label;
  $variables['answer']['id'] = $answer_step_id;
  $variables['answer']['path_step'] = $path_step;
  $variables['answer']['path_answer'] = $path_answer;
}
