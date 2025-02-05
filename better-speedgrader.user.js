// ==UserScript==
// @name         Better SpeedGrader
// @namespace    https://github.com/qwareeq8
// @version      0.1
// @description  Enhance SpeedGrader UI by auto-maximizing buttons, adjusting side widths, and ensuring rubric display.
// @author       Yusuf Qwareeq
// @match        https://*.instructure.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function disableIframes() {
        const iframes = document.querySelectorAll('iframe[src*="canvadoc_session"]');
        iframes.forEach(iframe => {
            iframe.src = 'about:blank';
        });
    }

    function clickButtonsByClass(selectors) {
        selectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => button.click());
        });
    }

    function maximizeInlineBlockButtons() {
        const buttons = document.querySelectorAll('.css-1a5spt8-view--inlineBlock-baseButton:not(.maximized)');
        buttons.forEach(button => {
            button.click();
            button.classList.add('maximized');
        });
    }

    function adjustSideWidths() {
        const leftSide = document.getElementById('left_side');
        const rightSide = document.getElementById('right_side');
        if (leftSide) leftSide.style.width = '0%';
        if (rightSide) rightSide.style.width = '100%';
    }

    function ensureRubricIsVisible() {
        const rubricFull = document.getElementById('rubric_full');
        if (rubricFull) rubricFull.style.display = 'block';
    }

    function preventFocusOnTextArea() {
        const originalFocus = HTMLTextAreaElement.prototype.focus;
        HTMLTextAreaElement.prototype.focus = function() {
            const id = this.getAttribute('id');
            if (id === 'TextArea_10') {
                console.log('Prevented focus on: ' + id);
            } else {
                originalFocus.apply(this, arguments);
            }
        };

        setTimeout(() => {
            HTMLTextAreaElement.prototype.focus = originalFocus;
        }, 5000);
    }

    function handleMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                disableIframes();
                clickButtonsByClass(['.css-ztoftp-view--inlineBlock-baseButton']);
                maximizeInlineBlockButtons();
                adjustSideWidths();
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.querySelector) {
                        const textarea = node.querySelector('textarea[data-selenium="criterion_comments_text"]');
                        if (textarea && !textarea.classList.contains('focus-prevention-applied')) {
                            textarea.disabled = true;
                            textarea.classList.add('focus-prevention-applied');
                            setTimeout(() => {
                                textarea.disabled = false;
                            }, 50);
                        }
                    }
                });
            }
        });
    }

    window.addEventListener('load', () => {
        preventFocusOnTextArea();
        disableIframes();
        clickButtonsByClass(['.css-ztoftp-view--inlineBlock-baseButton']);
        maximizeInlineBlockButtons();
        adjustSideWidths();
        ensureRubricIsVisible();
    });

    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
