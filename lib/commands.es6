import path from 'path';

import ShowboxError from './showbox-error';
import inlineImage  from './inline-image';

function parse(str) {
    let match = str.match(/!([^\s]+)(\s(.*))?/);
    if ( match ) {
        return [match[1], match[3]];
    } else {
        return [];
    }
}

function isCommand(node) {
    return node.type === 'paragraph' &&
           node.children[0].type === 'text' &&
           node.children[0].value[0] === '!';
}

function split(node) {
    return node.children[0].value.split('\n').map( s => s.trim() );
}

export default function commands(root, base) {
    let changed = {
        type:     root.type,
        children: [],
        position: root.position
    };
    let data = { };

    let image = function (file) {
        changed.children.push({
            type:  'html',
            value: '<img src="' + inlineImage(path.join(base, file)) + '">'
        });
    };
    let type = function (name) {
        if ( !data.types ) data.types = [];
        data.types.push(name);
    };

    for ( let i of root.children ) {
        if ( isCommand(i) ) {
            for ( let command of split(i) ) {
                let [name, param] = parse(command);

                if ( name === 'type' ) {
                    type(param);

                } else if ( name === 'image' ) {
                    image(param);

                } else if ( name === 'cover' ) {
                    image(param);
                    type('cover');

                } else if ( name === 'theme' ) {
                    data.theme = param;

                } else {
                    throw new ShowboxError('Unknown command !' + name);
                }
            }

        } else {
            changed.children.push(i);
        }
    }

    return [changed, data];
}
