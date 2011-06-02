/*
 * Tagedit - jQuery Plugin
 * The Plugin can be used to edit tags from a database the easy way
 *
 * Examples and documentation at: tagedit.webwork-albrecht.de
 * 
 * Copyright (c) 2010 Oliver Albrecht info@webwork-albrecht.de 
 *
 * License:
 * This work is licensed under a Creative Commons Attribution 3.0 Unported License.
 * http://creativecommons.org/licenses/by/3.0/
 *
 * @author Oliver Albrecht Mial: info@webwork-albrecht.de Twitter: @webworka
 * @version 1.0.2 (05/2011)
 * Requires: jQuery v1.4+, jQueryUI v1.8+, jQuerry.autoGrowInput
 *
 * Example of usage:
 *
 * $( "input.tag" ).tagedit();
 *
 * Possible options:
 *
 *  autocompleteURL: '', // url for a autocompletion
 *  deleteEmptyItems: true, // Deletes items with empty value
 *  deletedPostfix: '-d', // will be put to the Items that are marked as delete
 *  addedPostfix: '-a', // will be put to the Items that are choosem from the database
 *  additionalListClass: '', // put a classname here if the wrapper ul shoud receive a special class
 *  allowEdit: true, // Switch on/off edit entries
 *  allowDelete: true, // Switch on/off deletion of entries. Will be ignored if allowEdit = false
 *  allowAdd: true, // switch on/off the creation of new entries
 *  direction: 'ltr' // Sets the writing direction for Outputs and Inputs
 *  texts: { // some texts
 *      removeLinkTitle: 'Remove from list.',
 *      saveEditLinkTitle: 'Save changes.',
 *      deleteLinkTitle: 'Delete this tag from database.',
 *      deleteConfirmation: 'Are you sure to delete this entry?',
 *      deletedElementTitle: 'This Element will be deleted.',
 *      breakEditLinkTitle: 'Cancel'
 *  }
 */

(function($) {

    $.fn.tagedit = function(options) {
        /**
         * Merge Options with defaults
         */ 
        options = $.extend({
            // default options here
            autocompleteURL: '',
            deletedPostfix: '-d',
            addedPostfix: '-a',
            additionalListClass: '',
            allowEdit: true,
            allowDelete: true,
            allowAdd: true,
            direction: 'ltr',
            texts: {
                removeLinkTitle: 'Remove from list.',
                saveEditLinkTitle: 'Save changes.',
                deleteLinkTitle: 'Delete this tag from database.',
                deleteConfirmation: 'Are you sure to delete this entry?',
                deletedElementTitle: 'This Element will be deleted.',
                breakEditLinkTitle: 'Cancel'
            }
        }, options || {});
        
        // no action if there are no elements
        if(this.length == 0) {
            return;
        }
        
        // Set the direction of the inputs
        if(this.attr('dir').length > 0) {
            options.direction = this.attr('dir');
        }
        
        var elements = this;
        
        var baseNameRegexp = new RegExp("^(.*)\\[([0-9]*?("+options.deletedPostfix+"|"+options.addedPostfix+")?)?\]$", "i");
        
        var baseName = elements.eq(0).attr('name').match(baseNameRegexp);
        if(baseName && baseName.length == 4) {
            baseName = baseName[1];
        }
        else {
            // Elementname does not match the expected format, exit
            alert('elementname dows not match the expected format (regexp: '+baseNameRegexp+')')
            return;
        }
        
        // init elements
        inputsToList();
        
        /**
         * Creates the tageditinput from a list of textinputs
         *
         */ 
        function inputsToList() {
            var html = '<ul class="tagedit-list '+options.additionalListClass+'">';
            
            elements.each(function() {
                var element_name = $(this).attr('name').match(baseNameRegexp);
                if(element_name && element_name.length == 4 && (options.deleteEmptyItems == false || $(this).val().length > 0)) {
                    if(element_name[1].length > 0) {
                        var elementId = typeof element_name[2] != 'undefined'? element_name[2]: '';
                        
                        html += '<li class="tagedit-listelement tagedit-listelement-old">';
                        html += '<span dir="'+options.direction+'">' + $(this).val() + '</span>';
                        html += '<input type="hidden" name="'+baseName+'['+elementId+']" value="'+$(this).val()+'" />';
                        html += '<a class="tagedit-close" title="'+options.texts.removeLinkTitle+'">x</a>';
                        html += '</li>';
                    }
                }
            });
            
            // replace Elements with the list and save the list in the local variable elements
            elements.last().after(html)
            var newList = elements.last().next();
            elements.remove();
            elements = newList;
            
            // Check if some of the elementshav to be marked as deleted
            if(options.deletedPostfix.length > 0) {
                elements.find('input[name$="'+options.deletedPostfix+'\]"]').each(function() {
                    markAsDeleted($(this).parent());
                });
            }
            
            // put an input field at the End
            // Put an empty element at the end
            html = '<li class="tagedit-listelement tagedit-listelement-new">';
            html += '<input type="text" name="'+baseName+'[]" value="" id="tagedit-input" disabled="disabled" class="tagedit-input-disabled" dir="'+options.direction+'"/>';
            html += '</li>';
            html += '</ul>';
            
            elements
                .append(html)
                // Set function on the input
                .find('#tagedit-input')
                    .each(function() {
                        $(this).autoGrowInput({comfortZone: 15, minWidth: 15, maxWidth: 20000});
                        
                        $(this).bind('transformToTag', function(event, id) {
                            var oldValue = (typeof id != 'undefined' && id.length > 0);
                            
                            var checkAutocomplete = oldValue == true? false : true;
                            // check if the Value ist new
                            if(isNew($(this).val(), checkAutocomplete) == true) {
                                
                                if(options.allowAdd == true || oldValue) {
                                    // Make a new tag before the Input
                                    html = '<li class="tagedit-listelement tagedit-listelement-old">';
                                    html += '<span dir="'+options.direction+'">' + $(this).val() + '</span>';
                                    var name = oldValue? baseName + '['+id+options.addedPostfix+']' : baseName + '[]';
                                    html += '<input type="hidden" name="'+name+'" value="'+$(this).val()+'" />';
                                    html += '<a class="tagedit-close" title="'+options.texts.removeLinkTitle+'">x</a>';
                                    html += '</li>';
                                    
                                    $(this).parent().before(html);
                                }
                            }
                            $(this).val('');
                            
                            // autocompleter schliessen
                            if(options.autocompleteURL != false) {
                                $(this).autocomplete( "close" );
                            }
    
                        })
                        .keydown(function(event) {
                            var code = event.keyCode > 0? event.keyCode : event.which;
                     
                            switch(code) {
                                case 8: // BACKSPACE
                                    if($(this).val().length == 0) {
                                        // delete Last Tag
                                        var elementToRemove = elements.find('li.tagedit-listelement-old').last();
                                        elementToRemove.fadeOut(500, function() {elementToRemove.remove();})
                                        event.preventDefault();
                                        return false;
                                    }
                                    break;
                                case 9: // TAB
                                    if($(this).val().length > 0 && $('ul.ui-autocomplete #ui-active-menuitem').length == 0) {
                                        $(this).trigger('transformToTag');
                                        event.preventDefault();
                                        return false;
                                    }
                                    break;
                            }
                            return true;
                        })
                        .keypress(function(event) {
                            var code = event.keyCode > 0? event.keyCode : event.which;
                     
                            switch(code) {
                                case 44: // ,
                                case 13: // RETURN
                                    if($(this).val().length > 0 && $('ul.ui-autocomplete #ui-active-menuitem').length == 0) {
                                        $(this).trigger('transformToTag');
                                    }
                                    event.preventDefault();
                                    return false;
                            }
                            return true;
                        })
                        .blur(function() {
                            if($(this).val().length == 0) {
                                // disable the field to prevent sending with the form
                                $(this).attr('disabled', 'disabled').addClass('tagedit-input-disabled');
                            }
                            else {
                                // Delete entry after a timeout
                                var input = $(this);
                                $(this).data('blurtimer', window.setTimeout(function() {input.val('');}, 500));
                            }
                        })
                        .focus(function() {
                            window.clearTimeout($(this).data('blurtimer'));
                        });
                        
                        if(options.autocompleteURL != false) {
                            $(this).autocomplete({
                                    source: options.autocompleteURL,
                                    select: function( event, ui ) {
                                        $(this).val(ui.item.value).trigger('transformToTag', [ui.item.id]);
                                        return false;
                                    }
                            });
                        }
                    })
                .end()
                .click(function(event) {
                    switch(event.target.tagName) {
                        case 'A':
                            $(event.target).parent().fadeOut(500, function() {
                                $(event.target).parent().remove();
                                });
                            break;
                        case 'INPUT':
                        case 'SPAN':
                        case 'LI':
                            if($(event.target).hasClass('tagedit-listelement-deleted') == false &&
                               $(event.target).parent('li').hasClass('tagedit-listelement-deleted') == false) {
                                // Don't edit an deleted Items
                                return doEdit(event);
                            }
                        default:
                            $(this).find('#tagedit-input')
                                .removeAttr('disabled')
                                .removeClass('tagedit-input-disabled')
                                .focus();
                    }
                    return false;
                })
        }
        
        /**
         * Sets all Actions and events for editing an Existing Tag.
         *
         * @param event {object} The original Event that was given
         * return {boolean}
         */ 
        function doEdit(event) {
            if(options.allowEdit == false) {
                // Do nothing
                return;
            }
            
            var element = event.target.tagName == 'SPAN'? $(event.target).parent() : $(event.target);
            
            var closeTimer = null;

            element.bind('finishEdit', function(event, doReset) {
                window.clearTimeout(closeTimer);
                
                var textfield = $(this).find(':text');
                if(textfield.val().length > 0 && (typeof doReset == 'undefined' || doReset === false) && isNew(textfield.val(), true)) {
                    $(this).find(':hidden').val(textfield.val());
                    $(this).find('span').html(textfield.val());
                }
                
                textfield.remove();
                $(this).find('a.tagedit-save, a.tagedit-break, a.tagedit-delete, tester').remove(); // Workaround. This normaly has to be done by autogrow Plugin
                $(this).removeClass('tagedit-listelement-edit').unbind('finishEdit');
                return false;
            });
            
            var hidden = element.find(':hidden');
            html = '<input type="text" name="tmpinput" autocomplete="off" value="'+hidden.val()+'" class="tagedit-edit-input" dir="'+options.direction+'"/>';
            html += '<a class="tagedit-save" title="'+options.texts.saveEditLinkTitle+'">o</a>';
            html += '<a class="tagedit-break" title="'+options.texts.breakEditLinkTitle+'">x</a>';
            
            // If the Element is one from the Database, it can be deleted
            if(options.allowDelete == true && element.find(':hidden').length > 0 &&
               typeof element.find(':hidden').attr('name').match(baseNameRegexp)[3] != 'undefined') {
                html += '<a class="tagedit-delete" title="'+options.texts.deleteLinkTitle+'">d</a>';
            }
            
            hidden.after(html);
            element
                .addClass('tagedit-listelement-edit')
                .find('a.tagedit-save')
                    .click(function() {
                        $(this).parent().trigger('finishEdit');
                        return false;
                    })
                .end()
                .find('a.tagedit-break')
                    .click(function() {
                        $(this).parent().trigger('finishEdit', [true]);
                        return false;
                    })
                .end()
                .find('a.tagedit-delete')
                    .click(function() {
                        if(confirm(options.texts.deleteConfirmation)) {
                            markAsDeleted($(this).parent());
                        }
                        window.clearTimeout(closeTimer);
                        return false;
                    })
                .end()
                .find(':text')
                    .focus()
                    .autoGrowInput({comfortZone: 10, minWidth: 15, maxWidth: 20000})
                    .keypress(function(event) {
                        switch(event.keyCode) {
                            case 13: // RETURN
                                event.preventDefault();
                                $(this).parent().trigger('finishEdit');
                                return false;
                        }
                        return true;
                    })
                    .blur(function() {
                        var that = $(this);
                        closeTimer = window.setTimeout(function() {that.parent().trigger('finishEdit', [true])}, 500);
                    });
        }
        
        /**
         * Marks a single Tag as deleted.
         *
         * @param element {object}
         */ 
        function markAsDeleted(element) {
            element
                .trigger('finishEdit', [true])
                .addClass('tagedit-listelement-deleted')
                .attr('title', options.deletedElementTitle);
            element.find(':hidden').each(function() {
                        var nameEndRegexp = new RegExp('('+options.addedPostfix+'|'+options.deletedPostfix+')?\]');
                        var name = $(this).attr('name').replace(nameEndRegexp, options.deletedPostfix+']');
                        $(this).attr('name', name);
                    });
                    
        }
        
        /**
         * Checks if a tag is already choosen.
         *
         * @param value {string}
         * @param checkAutocomplete {boolean} optional Check also the autocomplet values
         * @returns {boolean}
         */ 
        function isNew(value, checkAutocomplete) {
            checkAutocomplete = typeof checkAutocomplete == 'undefined'? false : checkAutocomplete;
            
            var isNew = true;
            elements.find('li.tagedit-listelement-old input:hidden').each(function() {
                if($(this).val() == value) {
                    isNew = false;
                }
            });
            
            if(isNew == true && checkAutocomplete == true && options.autocompleteURL != false) {
                // Check also autocomplete values
                var autocompleteURL = options.autocompleteURL;
                if(autocompleteURL.match(/\?/)) {
                    autocompleteURL += '&';
                }
                else {
                    autocompleteURL += '?';
                }
                autocompleteURL += 'term=' + value;
                $.ajax({async: false,
                        url: autocompleteURL,
                        dataType: 'json',
                        complete: function(XMLHttpRequest, textStatus) {
                                var result = $.parseJSON(XMLHttpRequest.responseText);
                                // If there is an entry for that already in the autocomplete, don't use it
                                for(var i = 0; i < result.length; i++) {
                                    if(result[i].label == value) {
                                        isNew = false;
                                        break;
                                    }
                                }
                            }
                });
            }
            
            return isNew;
        }
        
    }
    
})(jQuery);
