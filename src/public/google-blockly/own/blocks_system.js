'use strict';

if (typeof goog !== 'undefined') {
    goog.provide('Blockly.JavaScript.System');

    goog.require('Blockly.JavaScript');
}

Blockly.CustomBlocks = Blockly.CustomBlocks || [];
Blockly.CustomBlocks.push('System');

Blockly.System = {
    HUE: 210,
    blocks: {}
};

// --- Debug output --------------------------------------------------
Blockly.System.blocks['debug'] =
    '<block type="debug">'
    + '     <value name="TEXT">'
    + '         <shadow type="text">'
    + '             <field name="TEXT">test</field>'
    + '         </shadow>'
    + '     </value>'
    + '</block>';

Blockly.Blocks['debug'] = {
    init: function() {
        this.appendValueInput('TEXT')
            .setCheck(null)
            .appendField(Blockly.Translate('debug'));

        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([['info', 'log'], ['debug', 'debug'], ['warning', 'warn'], ['error', 'error']]), 'Severity');

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(false);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('debug_tooltip'));
        this.setHelpUrl(getHelp('debug_help'));
    }
};

Blockly.JavaScript['debug'] = function(block) {
    const value_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
    const dropdown_severity = block.getFieldValue('Severity');

    return `console.${dropdown_severity}(${value_text});\n`;
};

// --- comment --------------------------------------------------
Blockly.System.blocks['comment'] =
    '<block type="comment">'
    + '     <value name="COMMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['comment'] = {
    init: function() {
        this.appendDummyInput('COMMENT')
            .appendField(new Blockly.FieldTextInput(Blockly.Translate('comment')), 'COMMENT');

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(false);
        this.setColour('#FFFF00');
        this.setTooltip(Blockly.Translate('comment_tooltip'));
    }
};

Blockly.JavaScript['comment'] = function(block) {
    const comment = block.getFieldValue('COMMENT');

    return `// ${comment}\n`;
};

// --- control -----------------------------------------------------------
Blockly.System.blocks['control'] =
    '<block type="control">'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="VALUE">'
    + '     </value>'
    + '     <value name="WITH_DELAY">'
    + '     </value>'
    + '     <mutation delay_input="false"></mutation>'
    + '     <value name="DELAY_MS">'
    + '     </value>'
    + '     <value name="UNIT">'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['control'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('control'));

        this.appendDummyInput('OID')
            .appendField(new Blockly.FieldOID('Object ID'), 'OID');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Translate('control_with'));

        this.appendDummyInput('WITH_DELAY')
            .appendField(Blockly.Translate('control_delay'))
            .appendField(new Blockly.FieldCheckbox('FALSE', function(option) {
                this.sourceBlock_.updateShape_(option === true || option === 'true' || option === 'TRUE');
            }), 'WITH_DELAY');

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('control_tooltip'));
        this.setHelpUrl(getHelp('control_help'));
    },
    mutationToDom: function() {
        const container = document.createElement('mutation');
        const option = this.getFieldValue('WITH_DELAY');

        container.setAttribute('delay_input', option === true || option === 'true' || option === 'TRUE');

        return container;
    },
    domToMutation: function(xmlElement) {
        const option = xmlElement.getAttribute('delay_input');
        this.updateShape_(option === true || option === 'true' || option === 'TRUE');
    },
    updateShape_: function(delayInput) {
        // Add or remove a delay Input.
        let inputExists = this.getInput('DELAY');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('DELAY')
                    .appendField(' ')
                    .appendField(new Blockly.FieldTextInput('1000'), 'DELAY_MS')
                    .appendField(new Blockly.FieldDropdown([
                        [Blockly.Translate('control_ms'), 'ms'],
                        [Blockly.Translate('control_sec'), 'sec'],
                        [Blockly.Translate('control_min'), 'min']
                    ]), 'UNIT');
            }
        } else if (inputExists) {
            this.removeInput('DELAY');
        }

        inputExists = this.getInput('CLEAR_RUNNING_INPUT');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('CLEAR_RUNNING_INPUT')
                    .appendField(Blockly.Translate('control_clear_running'))
                    .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');
            }
        } else if (inputExists) {
            this.removeInput('CLEAR_RUNNING_INPUT');
        }
    }
};

Blockly.JavaScript['control'] = function(block) {
    const valueObjectID = block.getFieldValue('OID');

    Blockly.Msg.VARIABLES_DEFAULT_NAME = 'value';

    let valueDelay = parseInt(block.getFieldValue('DELAY_MS'), 10);
    const unit = block.getFieldValue('UNIT');
    if (unit === 'min') {
        valueDelay *= 60000;
    } else if (unit === 'sec') {
        valueDelay *= 1000;
    }

    let clearRunning = block.getFieldValue('CLEAR_RUNNING');
    clearRunning = clearRunning === 'TRUE' || clearRunning === 'true' || clearRunning === true;

    const valueValue = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    const objectName = main.objects[valueObjectID] && main.objects[valueObjectID].common && main.objects[valueObjectID].common.name ? main.objects[valueObjectID].common.name : '';
    const withDelay = this.getFieldValue('WITH_DELAY');

    let code;
    if (withDelay === 'true' || withDelay === true || withDelay === 'TRUE') {
        code = `setStateDelayed('${valueObjectID}'${objectName ? ` /* ${objectName} */` : ''}, ${valueValue}, ${valueDelay}, ${clearRunning});\n`;
    } else {
        code = `setState('${valueObjectID}'${objectName ? ` /* ${objectName} */` : ''}, ${valueValue});\n`;
    }

    return code;
};

// --- toggle -----------------------------------------------------------
Blockly.System.blocks['toggle'] =
    '<block type="toggle">'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="WITH_DELAY">'
    + '     </value>'
    + '     <mutation delay_input="false"></mutation>'
    + '     <value name="DELAY_MS">'
    + '     </value>'
    + '     <value name="UNIT">'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['toggle'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('toggle'));

        this.appendDummyInput('OID')
            .appendField(new Blockly.FieldOID('Object ID'), 'OID');

        this.appendDummyInput('WITH_DELAY')
            .appendField(Blockly.Translate('toggle_delay'))
            .appendField(new Blockly.FieldCheckbox('FALSE', function(option) {
                this.sourceBlock_.updateShape_(option === true || option === 'true' || option === 'TRUE');
            }), 'WITH_DELAY');

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('toggle_tooltip'));
        this.setHelpUrl(getHelp('toggle_help'));
    },
    mutationToDom: function() {
        const container = document.createElement('mutation');
        const option = this.getFieldValue('WITH_DELAY');

        container.setAttribute('delay_input', option === true || option === 'true' || option === 'TRUE');

        return container;
    },
    domToMutation: function(xmlElement) {
        const option = xmlElement.getAttribute('delay_input');
        this.updateShape_(option === true || option === 'true' || option === 'TRUE');
    },
    updateShape_: function(delayInput) {
        // Add or remove a delay Input.
        let inputExists = this.getInput('DELAY');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('DELAY')
                    .appendField(' ')
                    .appendField(new Blockly.FieldTextInput('1000'), 'DELAY_MS')
                    .appendField(new Blockly.FieldDropdown([
                        [Blockly.Translate('control_ms'), 'ms'],
                        [Blockly.Translate('control_sec'), 'sec'],
                        [Blockly.Translate('control_min'), 'min']
                    ]), 'UNIT');
                //.appendField(Blockly.Translate('toggle_ms'));
            }
        } else if (inputExists) {
            this.removeInput('DELAY');
        }

        inputExists = this.getInput('CLEAR_RUNNING_INPUT');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('CLEAR_RUNNING_INPUT')
                    .appendField(Blockly.Translate('toggle_clear_running'))
                    .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');
            }
        } else if (inputExists) {
            this.removeInput('CLEAR_RUNNING_INPUT');
        }
    }
};

Blockly.JavaScript['toggle'] = function(block) {
    const valueObjectID = block.getFieldValue('OID');
    const unit  = block.getFieldValue('UNIT');

    Blockly.Msg.VARIABLES_DEFAULT_NAME = 'value';

    let valueDelay   = parseInt(block.getFieldValue('DELAY_MS'), 10);
    if (unit === 'min') {
        valueDelay *= 60000;
    } else if (unit === 'sec') {
        valueDelay *= 1000;
    }

    const objectName = main.objects[valueObjectID] && main.objects[valueObjectID].common && main.objects[valueObjectID].common.name ? main.objects[valueObjectID].common.name : '';
    const objectType = main.objects[valueObjectID] && main.objects[valueObjectID].common && main.objects[valueObjectID].common.type ? main.objects[valueObjectID].common.type : 'boolean';

    let clearRunning = block.getFieldValue('CLEAR_RUNNING');
    clearRunning = clearRunning === 'TRUE' || clearRunning === 'true' || clearRunning === true;

    let setCommand;
    if (objectType === 'number') {
        let max = 100;
        let min = 0;

        if (main.objects[valueObjectID].common.max !== undefined) {
            max = parseFloat(main.objects[valueObjectID].common.max);
        }
        if (main.objects[valueObjectID].common.min !== undefined) {
            min = parseFloat(main.objects[valueObjectID].common.min);
        }

        setCommand = `setState('${valueObjectID}'${objectName ? ` /* ${objectName} */` : ''}, state ? (state.val === ${min} ? ${max} : ${min}) : ${max});`;
    } else {
        setCommand = `setState('${valueObjectID}'${objectName ? ` /* ${objectName} */` : ''}, state ? !state.val : true);`;
    }

    const withDelay = block.getFieldValue('WITH_DELAY');

    let code;
    if (withDelay === 'TRUE' || withDelay === 'true' || withDelay === true) {
        code = `getState('${valueObjectID}', (err, state) => {\n` +
            Blockly.JavaScript.prefixLines(`setStateDelayed('${valueObjectID}'${objectName ? ` /* ${objectName} */` : ''}, state ? !state.val : true, ${valueDelay}, ${clearRunning});`, Blockly.JavaScript.INDENT) + '\n' +
            '});\n';
    } else {
        code = `getState('${valueObjectID}', (err, state) => {\n` +
            Blockly.JavaScript.prefixLines(setCommand, Blockly.JavaScript.INDENT) + '\n' +
            '});\n';
    }

    return code;
};

// --- update -----------------------------------------------------------
Blockly.System.blocks['update'] =
    '<block type="update">'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="VALUE">'
    + '     </value>'
    + '     <value name="WITH_DELAY">'
    + '     </value>'
    + '     <mutation delay_input="false"></mutation>'
    + '     <value name="DELAY_MS">'
    + '     </value>'
    + '     <value name="UNIT">'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['update'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('update'));

        this.appendDummyInput('OID')
            .appendField(new Blockly.FieldOID('Object ID'), 'OID');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Translate('update_with'));

        this.appendDummyInput('WITH_DELAY')
            .appendField(Blockly.Translate('update_delay'))
            .appendField(new Blockly.FieldCheckbox('FALSE', function(option) {
                this.sourceBlock_.updateShape_(option === true || option === 'true' || option === 'TRUE');
            }), 'WITH_DELAY');

        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('update_tooltip'));
        this.setHelpUrl(getHelp('update_help'));
    },
    mutationToDom: function() {
        const container = document.createElement('mutation');
        const option = this.getFieldValue('WITH_DELAY');

        container.setAttribute('delay_input', option === true || option === 'true' || option === 'TRUE');

        return container;
    },
    domToMutation: function(xmlElement) {
        const option = xmlElement.getAttribute('delay_input');
        this.updateShape_(option === true || option === 'true' || option === 'TRUE');
    },
    updateShape_: function(delayInput) {
        // Add or remove a delay Input.
        let inputExists = this.getInput('DELAY');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('DELAY')
                    .appendField(' ')
                    .appendField(new Blockly.FieldTextInput('1000'), 'DELAY_MS')
                    .appendField(new Blockly.FieldDropdown([
                        [Blockly.Translate('control_ms'), 'ms'],
                        [Blockly.Translate('control_sec'), 'sec'],
                        [Blockly.Translate('control_min'), 'min']
                    ]), 'UNIT');
                //.appendField(Blockly.Translate('update_ms'));
            }
        } else if (inputExists) {
            this.removeInput('DELAY');
        }

        inputExists = this.getInput('CLEAR_RUNNING_INPUT');

        if (delayInput) {
            if (!inputExists) {
                this.appendDummyInput('CLEAR_RUNNING_INPUT')
                    .appendField(Blockly.Translate('control_clear_running'))
                    .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');
            }
        } else if (inputExists) {
            this.removeInput('CLEAR_RUNNING_INPUT');
        }
    }
};

Blockly.JavaScript['update'] = function(block) {
    const value_objectid = block.getFieldValue('OID');

    Blockly.Msg.VARIABLES_DEFAULT_NAME = 'value';

    const value_value  = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    const unit  = block.getFieldValue('UNIT');

    let value_delay  = parseInt(block.getFieldValue('DELAY_MS'), 10);
    if (unit === 'min') {
        value_delay *= 60000;
    } else if (unit === 'sec') {
        value_delay *= 1000;
    }

    let clearRunning = block.getFieldValue('CLEAR_RUNNING');
    clearRunning = clearRunning === 'TRUE' || clearRunning === 'true' || clearRunning === true;

    const objectName = main.objects[value_objectid] && main.objects[value_objectid].common && main.objects[value_objectid].common.name ? main.objects[value_objectid].common.name : '';
    const withDelay = this.getFieldValue('WITH_DELAY');

    let code;
    if (withDelay === true || withDelay === 'true' || withDelay === 'TRUE') {
        code = `setStateDelayed('${value_objectid}'${objectName ? ` /* ${objectName} */` : ''}, ${value_value}, true, ${value_delay}, ${clearRunning});\n`;
    } else {
        code = `setState('${value_objectid}'${objectName ? ` /* ${objectName} */` : ''}, ${value_value}, true);\n`;
    }

    return code;
};

// --- direct binding -----------------------------------------------------------
Blockly.System.blocks['direct'] =
    '<block type="direct">'
    + '     <value name="OID_SRC">'
    + '         <shadow type="field_oid">'
    + '             <field name="oid">Object ID 1</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="OID_DST">'
    + '         <shadow type="field_oid">'
    + '             <field name="oid">Object ID 2</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="ONLY_CHANGES">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['direct'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('direct'));

        this.appendValueInput('OID_SRC')
            .setCheck('String')
            .appendField(Blockly.Translate('direct_oid_src'));

        this.appendValueInput('OID_DST')
            .setCheck('String')
            .appendField(Blockly.Translate('direct_oid_dst'));

        this.appendDummyInput('ONLY_CHANGES')
            .appendField(Blockly.Translate('direct_only_changes'))
            .appendField(new Blockly.FieldCheckbox('TRUE'), 'ONLY_CHANGES');

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.Trigger.HUE);
        this.setTooltip(Blockly.Translate('direct_tooltip'));
        this.setHelpUrl(getHelp('direct_help'));
    }
};

Blockly.JavaScript['direct'] = function(block) {
    const oidSrc = Blockly.JavaScript.valueToCode(block, 'OID_SRC', Blockly.JavaScript.ORDER_ATOMIC);
    const oidDest = Blockly.JavaScript.valueToCode(block, 'OID_DST', Blockly.JavaScript.ORDER_ATOMIC);

    let onlyChanges = block.getFieldValue('ONLY_CHANGES');
    onlyChanges = onlyChanges === true || onlyChanges === 'true' || onlyChanges === 'TRUE';

    return `on({ id: ${oidSrc}, change: '${onlyChanges ? 'ne' : 'any'}' }, (obj) => {\n` +
        Blockly.JavaScript.prefixLines(`setState(${oidDest}, obj.state.val);`, Blockly.JavaScript.INDENT) + '\n' +
        '});\n';
};

// --- control ex -----------------------------------------------------------
Blockly.System.blocks['control_ex'] =
    '<block type="control_ex">'
    + '     <value name="OID">'
    + '         <shadow type="field_oid">'
    + '             <field name="oid">Object ID</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="VALUE">'
    + '         <shadow type="logic_boolean">'
    + '             <field name="BOOL">TRUE</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="TYPE">'
    + '     </value>'
    + '     <value name="DELAY_MS">'
    + '         <shadow type="math_number">'
    + '             <field name="NUM">0</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="CLEAR_RUNNING">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['control_ex'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('control_ex'));

        this.appendValueInput('OID')
            .setCheck('String')
            .appendField(Blockly.Translate('field_oid_OID'));

        this.appendDummyInput('TYPE')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('control_ex_control'),   'false'],
                [Blockly.Translate('control_ex_update'),    'true']
            ]), 'TYPE');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Translate('control_ex_value'));

        this.appendValueInput('DELAY_MS')
            .setCheck('Number')
            .appendField(Blockly.Translate('control_ex_delay'));

        this.appendDummyInput('CLEAR_RUNNING_INPUT')
            .appendField(Blockly.Translate('control_ex_clear_running'))
            .appendField(new Blockly.FieldCheckbox(), 'CLEAR_RUNNING');

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('control_tooltip'));
        this.setHelpUrl(getHelp('control_help'));
    }
};

Blockly.JavaScript['control_ex'] = function(block) {
    const valueObjectID = Blockly.JavaScript.valueToCode(block, 'OID', Blockly.JavaScript.ORDER_ATOMIC);
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    const valueDelay = Blockly.JavaScript.valueToCode(block, 'DELAY_MS', Blockly.JavaScript.ORDER_ATOMIC);

    let clearRunning = block.getFieldValue('CLEAR_RUNNING');
    clearRunning = clearRunning === true || clearRunning === 'true' || clearRunning === 'TRUE';

    let type = block.getFieldValue('TYPE');
    type = type === true || type === 'true' || type === 'TRUE';

    return `setStateDelayed(${valueObjectID}, ${value}, ${type}, parseInt(((${valueDelay}) || '').toString(), 10), ${clearRunning});\n`;
};

// --- create state --------------------------------------------------
Blockly.System.blocks['create'] =
    '<block type="create">'
    + '     <value name="NAME">'
    + '     </value>'
    + '     <value name="VALUE">'
    + '     </value>'
    + '     <value name="COMMON">'
    + '     </value>'
    + '     <value name="STATEMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['create'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('create'));

        this.appendDummyInput('NAME')
            .appendField(Blockly.Translate('create_oid'))
            .appendField(new Blockly.FieldTextInput(Blockly.Translate('create_jsState')), 'NAME');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Translate('create_init'));

        this.appendValueInput('COMMON')
            .setCheck(null)
            .appendField(Blockly.Translate('create_common'));

        this.appendStatementInput('STATEMENT')
            .setCheck(null);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setInputsInline(false);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('create_tooltip'));
        this.setHelpUrl(getHelp('create_help'));
    }
};

Blockly.JavaScript['create'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    const common = Blockly.JavaScript.valueToCode(block, 'COMMON', Blockly.JavaScript.ORDER_ATOMIC);
    const statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');

    let paraV = '';
    let paraC = '';

    if (value !== null && value !== '') {
        paraV = ', ' + value;
    }

    if (common !== null && common !== '') {
        if (typeof common === 'object') {
            paraC = `, JSON.parse(${JSON.stringify(common)})`;
        } else {
            paraC = `, JSON.parse(${common})`;
        }
    }

    return `createState('${name}'${paraV}${paraC}, async () => {\n` +
        statement +
        '});\n';
};

// --- create state ex --------------------------------------------------
Blockly.System.blocks['create_ex'] =
    '<block type="create_ex">'
    + '     <value name="NAME">'
    + '     </value>'
    + '     <value name="TYPE">'
    + '     </value>'
    + '     <value name="VALUE">'
    + '     </value>'
    + '     <value name="READABLE">'
    + '     </value>'
    + '     <value name="WRITEABLE">'
    + '     </value>'
    + '     <value name="STATEMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['create_ex'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('create'));

        this.appendDummyInput('NAME')
            .appendField(Blockly.Translate('create_oid'))
            .appendField(new Blockly.FieldTextInput(Blockly.Translate('create_jsState')), 'NAME');

        this.appendDummyInput('TYPE')
            .appendField(Blockly.Translate('create_type'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('create_type_string'), 'string'],
                [Blockly.Translate('create_type_number'), 'number'],
                [Blockly.Translate('create_type_boolean'), 'boolean'],
                [Blockly.Translate('create_type_json'), 'json'],
                //[Blockly.Translate('create_type_object'), 'object'],
                //[Blockly.Translate('create_type_array'), 'array'],
                //[Blockly.Translate('create_type_file'), 'file'],
            ]), 'TYPE');

        this.appendValueInput('VALUE')
            .setCheck(null)
            .appendField(Blockly.Translate('create_init'));

        this.appendDummyInput('READABLE_INPUT')
            .appendField(Blockly.Translate('create_readable'))
            .appendField(new Blockly.FieldCheckbox('FALSE'), 'READABLE');

        this.appendDummyInput('WRITEABLE_INPUT')
            .appendField(Blockly.Translate('create_writeable'))
            .appendField(new Blockly.FieldCheckbox('FALSE'), 'WRITEABLE');

        this.appendStatementInput('STATEMENT')
            .setCheck(null);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setInputsInline(false);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('create_tooltip'));
        this.setHelpUrl(getHelp('create_help'));
    }
};

Blockly.JavaScript['create_ex'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
    const statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');

    let paraV = '';

    if (value !== null && value !== '') {
        if (type === 'number') {
            paraV = `, parseFloat(${value})`;
        } else {
            paraV = ', ' + value;
        }
    }

    let readable = block.getFieldValue('READABLE');
    readable = readable === 'TRUE' || readable === 'true' || readable === true;

    let writeable = block.getFieldValue('WRITEABLE');
    writeable = writeable === 'TRUE' || writeable === 'true' || writeable === true;

    return `createState('${name}'${paraV}, { type: "${type}", read: ${readable}, write: ${writeable} }, async () => {\n` +
        statement +
        '});\n';
};

// --- get value --------------------------------------------------
Blockly.System.blocks['get_value'] =
    '<block type="get_value">'
    + '     <value name="ATTR">'
    + '     </value>'
    + '     <value name="OID">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['get_value'] = {
    // Checkbox.
    init: function() {

        this.appendDummyInput('ATTR')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('get_value_val'),      'val'],
                [Blockly.Translate('get_value_ack'),      'ack'],
                [Blockly.Translate('get_value_ts'),       'ts'],
                [Blockly.Translate('get_value_lc'),       'lc'],
                [Blockly.Translate('get_value_q') ,       'q'],
                [Blockly.Translate('get_value_comment') , 'c'],
                [Blockly.Translate('get_value_from'),     'from'],

                [Blockly.Translate('get_common_name'),   'common.name'],
                [Blockly.Translate('get_common_desc'),   'common.desc'],
                [Blockly.Translate('get_common_unit'),   'common.unit'],
                [Blockly.Translate('get_common_role'),   'common.role'],
                [Blockly.Translate('get_common_state_type'), 'common.type'],
                [Blockly.Translate('get_common_object_type'), 'type'],
                [Blockly.Translate('get_common_read'),    'common.read'],
                [Blockly.Translate('get_common_write'),   'common.write'],
            ]), 'ATTR');

        this.appendDummyInput()
            .appendField(Blockly.Translate('get_value_OID'));

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID(Blockly.Translate('get_value_default')), 'OID');

        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('get_value_tooltip'));
        this.setHelpUrl(getHelp('get_value_help'));
    }
};

Blockly.JavaScript['get_value'] = function(block) {
    const oid  = block.getFieldValue('OID');
    const attr = block.getFieldValue('ATTR');

    if (attr === 'type' || attr.startsWith('common.')) {
        return [`(await getObjectAsync('${oid}')).${attr}`, Blockly.JavaScript.ORDER_ATOMIC];
    } else {
        return [`getState('${oid}').${attr}`, Blockly.JavaScript.ORDER_ATOMIC];
    }
};

// --- get value var --------------------------------------------------
Blockly.System.blocks['get_value_var'] =
    '<block type="get_value_var">'
    + '     <value name="ATTR">'
    + '     </value>'
    + '     <value name="OID">'
    + '         <shadow type="text">'
    + '             <field name="OID">zigbee.0.1234</field>'
    + '         </shadow>'
    + '     </value>'
    + '</block>';

Blockly.Blocks['get_value_var'] = {
    init: function() {
        this.appendDummyInput('ATTR')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('get_value_val'),      'val'],
                [Blockly.Translate('get_value_ack'),      'ack'],
                [Blockly.Translate('get_value_ts'),       'ts'],
                [Blockly.Translate('get_value_lc'),       'lc'],
                [Blockly.Translate('get_value_q') ,       'q'],
                [Blockly.Translate('get_value_comment') , 'c'],
                [Blockly.Translate('get_value_from'),     'from'],

                [Blockly.Translate('get_common_name'),   'common.name'],
                [Blockly.Translate('get_common_desc'),   'common.desc'],
                [Blockly.Translate('get_common_unit'),   'common.unit'],
                [Blockly.Translate('get_common_role'),   'common.role'],
                [Blockly.Translate('get_common_state_type'), 'common.type'],
                [Blockly.Translate('get_common_object_type'), 'type'],
                [Blockly.Translate('get_common_read'),    'common.read'],
                [Blockly.Translate('get_common_write'),   'common.write'],
            ]), 'ATTR');

        this.appendDummyInput()
            .appendField(Blockly.Translate('get_value_OID'));

        this.appendValueInput('OID')
            .setCheck(null);

        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('get_value_tooltip'));
        this.setHelpUrl(getHelp('get_value_help'));
    }
};

Blockly.JavaScript['get_value_var'] = function(block) {
    const oid  = Blockly.JavaScript.valueToCode(block, 'OID', Blockly.JavaScript.ORDER_ATOMIC);
    const attr = block.getFieldValue('ATTR');

    if (attr === 'type' || attr.startsWith('common.')) {
        return [`(await getObjectAsync(${oid})).${attr}`, Blockly.JavaScript.ORDER_ATOMIC];
    } else {
        return [`getState(${oid}).${attr}`, Blockly.JavaScript.ORDER_ATOMIC];
    }
};

// --- get value async--------------------------------------------------
Blockly.System.blocks['get_value_async'] =
    '<block type="get_value_async">'
    + '     <value name="ATTR">'
    + '     </value>'
    + '     <value name="OID">'
    + '     </value>'
    + '     <value name="STATEMENT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['get_value_async'] = {
    init: function() {
        this.appendDummyInput('ATTR')
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('get_value_val'),    'val'],
                [Blockly.Translate('get_value_ack'),    'ack'],
                [Blockly.Translate('get_value_ts'),     'ts'],
                [Blockly.Translate('get_value_lc'),     'lc'],
                [Blockly.Translate('get_value_q') ,       'q'],
                [Blockly.Translate('get_value_comment') , 'c'],
                [Blockly.Translate('get_value_from'),     'from'],

                [Blockly.Translate('get_common_name'),   'common.name'],
                [Blockly.Translate('get_common_desc'),   'common.desc'],
                [Blockly.Translate('get_common_unit'),   'common.unit'],
                [Blockly.Translate('get_common_role'),   'common.role'],
                [Blockly.Translate('get_common_state_type'), 'common.type'],
                [Blockly.Translate('get_common_object_type'), 'type'],
                [Blockly.Translate('get_common_read'),    'common.read'],
                [Blockly.Translate('get_common_write'),   'common.write'],
            ]), 'ATTR');

        this.appendDummyInput()
            .appendField(Blockly.Translate('get_value_OID'));

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID(Blockly.Translate('get_value_default')), 'OID');

        this.appendStatementInput('STATEMENT')
            .setCheck(null);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('get_value_tooltip'));
        this.setHelpUrl(getHelp('get_value_help'));
    }
};

Blockly.JavaScript['get_value_async'] = function(block) {
    const oid  = block.getFieldValue('OID');
    const attr = block.getFieldValue('ATTR');
    const statement = Blockly.JavaScript.statementToCode(block, 'STATEMENT');

    if (attr === 'type' || attr.startsWith('common.')) {
        return `getObjectAsync('${oid}', async (err, obj) => {\n` +
            Blockly.JavaScript.prefixLines('let value = obj.' + attr + ';', Blockly.JavaScript.INDENT) + '\n' +
            statement + '\n' +
            '});\n';
    } else {
        return 'getState("' + oid + '", async (err, state) => {\n' +
            Blockly.JavaScript.prefixLines('let value = state.' + attr + ';', Blockly.JavaScript.INDENT) + '\n' +
            statement + '\n' +
            '});\n';
    }
};

// --- select OID --------------------------------------------------
Blockly.System.blocks['field_oid'] =
    '<block type="field_oid">'
    + '     <value name="TEXT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['field_oid'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('field_oid_OID'));

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID('default'), 'oid');

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Translate('field_oid_tooltip'));
    }
};

Blockly.JavaScript['field_oid'] = function(block) {
    const oid = block.getFieldValue('oid');

    return [`'${oid}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- select OID meta--------------------------------------------------
Blockly.System.blocks['field_oid_meta'] =
    '<block type="field_oid_meta">'
    + '     <value name="TEXT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['field_oid_meta'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('field_oid_OID_meta'));

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID('default', 'meta'), 'oid');

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Translate('field_oid_tooltip'));
    }
};

Blockly.JavaScript['field_oid_meta'] = function(block) {
    const oid = block.getFieldValue('oid');

    return [`'${oid}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- select OID script--------------------------------------------------
Blockly.System.blocks['field_oid_script'] =
    '<block type="field_oid_script">'
    + '     <value name="TEXT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['field_oid_script'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('field_oid_OID_script'));

        this.appendDummyInput()
            .appendField(new Blockly.FieldOID('default', 'script'), 'oid');

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setOutput(true, 'String');
        this.setTooltip(Blockly.Translate('field_oid_tooltip'));
    }
};

Blockly.JavaScript['field_oid_script'] = function(block) {
    const oid = block.getFieldValue('oid');

    return [`'${oid}'`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- get attribute --------------------------------------------------
Blockly.System.blocks['get_attr'] =
    '<block type="get_attr">'
    + '     <value name="PATH">'
    + '         <shadow type="text">'
    + '             <field name="PATH">attr1.attr2</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="OBJECT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['get_attr'] = {
    init: function() {
        this.appendValueInput('PATH')
            .setCheck(null)
            .appendField(Blockly.Translate('get_attr_path'));

        this.appendValueInput('OBJECT')
            .appendField(Blockly.Translate('get_attr_by'));

        this.setInputsInline(true);
        this.setOutput(true);
        this.setColour(Blockly.System.HUE);
        this.setTooltip(Blockly.Translate('get_attr_tooltip'));
        this.setHelpUrl(getHelp('get_attr_help'));
    }
};

Blockly.JavaScript['get_attr'] = function(block) {
    const path = Blockly.JavaScript.valueToCode(block, 'PATH', Blockly.JavaScript.ORDER_ATOMIC);
    const obj  = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_ATOMIC);

    return ['getAttr(' + obj + ', ' + path + ')', Blockly.JavaScript.ORDER_ATOMIC];
};

// --- regex --------------------------------------------------
Blockly.System.blocks['regex'] =
    '<block type="regex">'
    + '     <value name="TEXT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['regex'] = {
    init: function() {
        this.appendDummyInput()
            .appendField('RegExp');

        this.appendDummyInput('TEXT')
            .appendField(new Blockly.FieldTextInput('(.*)'), 'TEXT');

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setOutput(true, 'Array');
        this.setTooltip(Blockly.Translate('field_oid_tooltip'));
    }
};

Blockly.JavaScript['regex'] = function(block) {
    const oid = block.getFieldValue('TEXT');

    return [`new RegExp('${oid}')`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- selector --------------------------------------------------
Blockly.System.blocks['selector'] =
    '<block type="selector">'
    + '     <value name="TEXT">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['selector'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(Blockly.Translate('selector') + ' $(');

        this.appendDummyInput('TEXT')
            .appendField(new Blockly.FieldTextInput('channel[state.id=*]'), 'TEXT');

        this.appendDummyInput()
            .appendField(')');

        this.setInputsInline(true);
        this.setColour(Blockly.System.HUE);
        this.setOutput(true, 'Array');
        this.setTooltip(Blockly.Translate('field_oid_tooltip'));
    }
};

Blockly.JavaScript['selector'] = function(block) {
    const oid = block.getFieldValue('TEXT');

    return [`Array.prototype.slice.apply($('${oid}'))`, Blockly.JavaScript.ORDER_ATOMIC];
};