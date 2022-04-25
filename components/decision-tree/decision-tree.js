/**
 * @file
 * Provides custom functionality for decision tree.
 */

/**
 * Class representing a Decision tree.
 */
class DecisionTree {

  /**
   * Class constructor.
   *
   * @param {Object} config
   *   Decision tree settings object.
   */
  constructor (jquery, cookies, config) {
    this.$ = jquery;
    this.cookies = cookies;
    this.config = config;
    // load all the steps available in DOM.
    this.config.steps = this._loadSteps();
    this.storage = this._loadStorage();
    // Activate the decision tree.
    this.activate();
  }

  /**
   * load all the steps of the active decision tree into config.
   */
  _loadSteps () {
    var steps = [];
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content').find('.step__id').each(function (index, el) {
      steps.push(el.innerText);
    });
    return steps;
  }

  /**
   * Validate the history of the active decision tree.
   */
  _validateHistory (storage) {
    // Reset history if it has legacy data/data which does not exist in DOM.
    var history = storage[this.config.id].history;
    var steps = this.config.steps ? this.config.steps : this._loadSteps();
    if (history.length > 0 && steps.length > 0) {
      var valid = history.every(function (val) {
        return steps.indexOf(val) !== -1;
      });
      if (valid === false) {
        storage[this.config.id].history = [this.config.first_step];
        storage[this.config.id].active = this.config.first_step;
        this.storage = storage;
        this._saveStorage();
      }
    }
    return storage;
  }

  /**
   * load the active decision tree from local storage.
   */
  _loadStorage () {
    var storage = JSON.parse(localStorage.getItem('decision_tree')) || {};
    if (storage[this.config.id] !== undefined) {
      storage = this._validateHistory(storage);
      return storage[this.config.id];
    }
    return {
      "first_step": this.config.first_step,
      "active": this.config.first_step,
      "history": [this.config.first_step]
    };
  }

  /**
   * Save the active decision tree to local storage.
   */
  _saveStorage () {
    var storage = JSON.parse(localStorage.getItem('decision_tree')) || {};
    storage[this.config.id] = this.storage;
    localStorage.setItem('decision_tree', JSON.stringify(storage));
  }

  /**
   * Hide the active decision tree back and restart button if its invalid.
   */
  _hideFooter () {
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-footer').hide();
  };

  /**
   * Show the active step of the active decision tree and store it to local
   * storage.
   */
  activate () {
    if (this.config.valid) {
      this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active).removeClass("visually-hidden");
      // Save the storage.
      this._saveStorage();
      // Track footer
      this.trackFooter();
    }
    else {
      // Hide footer
      this._hideFooter();
    }
  };

  /**
   * Hide the active decision tree back and restart button if its first step.
   */
  trackFooter () {
    if (this.storage.history.length > 1) {
      this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-footer').show();
    }
    else {
      this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-footer').hide();
    }
  };

  /**
   * Track the answer.
   */
  trackAnswer (nextStep, stepPath, answerPath) {
    // Hide current/active step
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active).addClass("visually-hidden");
    // Show next step
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + nextStep).removeClass("visually-hidden");
    // Make the next step as active.
    this.storage.active = nextStep;
    // Track history.
    this.storage.history.push(this.storage.active);
    // Save the storage.
    this._saveStorage();
    // Track the attribute.
    this.trackAttribute(nextStep);
    // Track the answer path via google analytics.
    this.trackGA(answerPath);
    // Track the step path via google analytics.
    this.trackGA(stepPath);
    // Show step info if there are no further questions.
    var furtherQuestions = this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__answers').html().replace(/<\!--.*?-->/g, '').trim().length;
    if (furtherQuestions === 0) {
      // Show Step info
      this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + nextStep + ' .step__info').show();
      var infoHTML = '';
      // copy history values to a local variable.
      var history = this.storage.history.slice();
      // Remove current step.
      history.pop();
      history.forEach((el) => {
        infoHTML += this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + el + ' .step__info').html();
      });
      // Append info html into the step info extra.
      this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + nextStep + ' .step__info--extra').append(infoHTML);
      // Append info heading into the step info heading.
      this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + nextStep + ' .step__info--heading').append(this.config.info_heading);
    }
    // Track Footer
    this.trackFooter();
  }

  /**
   * Track the back button.
   */
  trackBackButton () {
    if (this.storage.history.length <= 1) {
      return;
    }
    // Hide current/active step
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active).addClass("visually-hidden");
    var previousStep = this.storage.history[this.storage.history.length - 2];
    // Show previous step from history.
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + previousStep).removeClass("visually-hidden");
    // Track the active step into google analytics.
    var activeStepPath = this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__path').text() + '/back';
    this.trackGA(activeStepPath);
    // Hide Step info and empty step info extra and step info heading
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__info').hide();
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__info--extra').empty();
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__info--heading').empty();
    // Make the next step as active.
    this.storage.active = previousStep;
    // Remove last step from history.
    this.storage.history.pop();
    // Save the storage.
    this._saveStorage();
    // Track the attribute.
    this.trackAttribute(this.storage.active);
    // Track the new active step into google analytics.
    var newactiveStepPath = this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__path').text();
    this.trackGA(newactiveStepPath);
    // Track Footer
    this.trackFooter();
  }

  /**
   * Track the restart button.
   */
  trackRestartButton () {
    // Hide current/active step
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active).addClass("visually-hidden");
    // Show first step.
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.first_step).removeClass("visually-hidden");
    // Track the active step into google analytics.
    var activeStepPath = this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__path').text() + '/restart';
    this.trackGA(activeStepPath);
    // Hide Step info and empty step info extra and empty step info heading
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__info').hide();
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__info--extra').empty();
    this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.storage.active + ' .step__info--heading').empty();
    // Make first step as active Step.
    this.storage.active = this.config.first_step;
    // Wipe out history.
    this.storage.history = [this.config.first_step];
    // Save the storage.
    this._saveStorage();
    // Track the attribute.
    this.trackAttribute(this.storage.active);
    // Track the first step into google analytics.
    var firstStepPath = this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + this.config.first_step + ' .step__path').text();
    this.trackGA(firstStepPath);
    // Track Footer
    this.trackFooter();
  }

  /**
   * Track attribute into local storage.
   */
  trackAttribute (id) {
    var step = this.$('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + id + ' .step__attribute');
    // Store the attribute.
    if (step && step.attr('data-key') && step.attr('data-value')) {
      this.cookies.set(step.attr('data-key'), step.attr('data-value'));
    }
  }

  /**
   * Track pages via google analytics.
   */
  trackGA (path) {
    if (typeof gtag === "function" && drupalSettings.google_analytics !== 'undefined') {
      gtag('config', drupalSettings.google_analytics.account, {
        page_path: path
      });
    }
    else if (typeof ga === "function" && ga.getAll()[0].get('clientId') !== null && ga.getAll()[0].get('trackingId') !== null) {
      ga('create', ga.getAll()[0].get('trackingId'), {
        'clientId': ga.getAll()[0].get('clientId')
      });
      ga('send', 'pageview', path);
    }
  };
}

(function ($, Drupal, cookies, config) {
  'use strict';
  // Initialize the decision tree object.
  const dt = new DecisionTree($, cookies, config);
  // Track first step attribute.
  dt.trackAttribute(config.first_step);
  // Track first step into google analytics.
  var firstStepPath = $('.node--type-decision_tree .view-id-decision_tree_steps .view-content .node-' + config.first_step + ' .step__path').text();
  dt.trackGA(firstStepPath);
  Drupal.behaviors.decisionTree = {
    attach: function (context, settings) {
      // Track answer.
      $('.node--type-decision_tree .view-id-decision_tree_steps .view-content .step .step__answer', context).click(function () {
        dt.trackAnswer(this.attributes["data-step-id"].value, this.attributes["data-step-path"].value, this.attributes["data-answer-path"].value);
      });
      // Track back button.
      $('.node--type-decision_tree .view-id-decision_tree_steps .view-footer .step__button--back', context).click(function () {
        dt.trackBackButton();
      });
      // Track restart button.
      $('.node--type-decision_tree .view-id-decision_tree_steps .view-footer .step__button--restart', context).click(function () {
        dt.trackRestartButton();
      });
    }
  };
})(jQuery, Drupal, window.Cookies, drupalSettings.decision_tree);
