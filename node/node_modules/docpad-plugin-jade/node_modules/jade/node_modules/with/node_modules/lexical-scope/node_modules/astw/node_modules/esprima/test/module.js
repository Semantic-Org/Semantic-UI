/*jslint browser:true plusplus:true */
/*global require:true */
function runTests() {
    'use strict';

    function setText(el, str) {
        if (typeof el.innerText === 'string') {
            el.innerText = str;
        } else {
            el.textContent = str;
        }
    }

    function reportSuccess(code) {
        var report, e;
        report = document.getElementById('report');
        e = document.createElement('pre');
        e.setAttribute('class', 'code');
        setText(e, code);
        report.appendChild(e);
    }

    function reportFailure(code, expected, actual) {
        var report, e;

        report = document.getElementById('report');

        e = document.createElement('pre');
        e.setAttribute('class', 'code');
        setText(e, code);
        report.appendChild(e);

        e = document.createElement('p');
        setText(e, 'Expected type: ' + expected);
        report.appendChild(e);

        e = document.createElement('p');
        setText(e, 'Actual type: ' + actual);
        report.appendChild(e);
    }


    require(['../esprima'], function (ESParser) {
        var tick, total, failures, obj, variable, variables, i, entry, entries;

        // We check only the type of some members of ESParser.
        variables = {
            'version': 'string',
            'parse': 'function',
            'Syntax': 'object',
            'Syntax.AssignmentExpression': 'string',
            'Syntax.ArrayExpression': 'string',
            'Syntax.BlockStatement': 'string',
            'Syntax.BinaryExpression': 'string',
            'Syntax.BreakStatement': 'string',
            'Syntax.CallExpression': 'string',
            'Syntax.CatchClause': 'string',
            'Syntax.ConditionalExpression': 'string',
            'Syntax.ContinueStatement': 'string',
            'Syntax.DoWhileStatement': 'string',
            'Syntax.DebuggerStatement': 'string',
            'Syntax.EmptyStatement': 'string',
            'Syntax.ExpressionStatement': 'string',
            'Syntax.ForStatement': 'string',
            'Syntax.ForInStatement': 'string',
            'Syntax.FunctionDeclaration': 'string',
            'Syntax.FunctionExpression': 'string',
            'Syntax.Identifier': 'string',
            'Syntax.IfStatement': 'string',
            'Syntax.Literal': 'string',
            'Syntax.LabeledStatement': 'string',
            'Syntax.LogicalExpression': 'string',
            'Syntax.MemberExpression': 'string',
            'Syntax.NewExpression': 'string',
            'Syntax.ObjectExpression': 'string',
            'Syntax.Program': 'string',
            'Syntax.Property': 'string',
            'Syntax.ReturnStatement': 'string',
            'Syntax.SequenceExpression': 'string',
            'Syntax.SwitchStatement': 'string',
            'Syntax.SwitchCase': 'string',
            'Syntax.ThisExpression': 'string',
            'Syntax.ThrowStatement': 'string',
            'Syntax.TryStatement': 'string',
            'Syntax.UnaryExpression': 'string',
            'Syntax.UpdateExpression': 'string',
            'Syntax.VariableDeclaration': 'string',
            'Syntax.VariableDeclarator': 'string',
            'Syntax.WhileStatement': 'string',
            'Syntax.WithStatement': 'string'
        };

        total = failures = 0;
        tick = new Date();

        for (variable in variables) {
            if (variables.hasOwnProperty(variable)) {
                entries = variable.split('.');
                obj = ESParser;
                for (i = 0; i < entries.length; ++i) {
                    entry = entries[i];
                    if (typeof obj[entry] !== 'undefined') {
                        obj = obj[entry];
                    } else {
                        obj = undefined;
                        break;
                    }
                }
                total++;
                if (typeof obj === variables[variable]) {
                    reportSuccess(variable);
                } else {
                    failures++;
                    reportFailure(variable, variables[variable], typeof obj);
                }
            }
        }

        tick = (new Date()) - tick;

        if (failures > 0) {
            setText(document.getElementById('status'), total + ' tests. ' +
                'Failures: ' + failures + '. ' + tick + ' ms');
        } else {
            setText(document.getElementById('status'), total + ' tests. ' +
                'No failure. ' + tick + ' ms');
        }
    });
}
