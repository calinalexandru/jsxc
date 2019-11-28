import {AbstractPlugin} from '../plugin/AbstractPlugin'
import PluginAPI from '../plugin/PluginAPI'
import Translation from '@util/Translation';
import Message from "@src/Message";
import {$iq} from '../vendor/Strophe'

const MIN_VERSION = '4.0.0';
const MAX_VERSION = '4.0.0';

export default class KickCommandPlugin extends AbstractPlugin {
    public static getId(): string {
        return 'kick-command';
    }

    public static getName(): string {
        return 'The /kick Command';
    }

    public static getDescription(): string {
        return Translation.t('setting-kickCommand-enable');
    }

    constructor(pluginAPI: PluginAPI) {
        super(MIN_VERSION, MAX_VERSION, pluginAPI);

        pluginAPI.addPreSendMessageStanzaProcessor(this.preSendMessageStanzaProcessor);
    }

    private preSendMessageStanzaProcessor = (message: Message, xmlElement: Strophe.Builder): Promise<[Message, Strophe.Builder]> => {
        const body = (<any>xmlElement).node.textContent;
        const xmlOrig: any = xmlElement;
        const commandStr = body.match(/^\/(kick|ban)\s(.*)/);
        let role = '';

        if (commandStr) {
            const command = commandStr[1];
            const toUser = commandStr[2];
            if (command === 'kick') {
                role = 'none';
            }else if (command === 'ban') {
                role = 'outcast';
            }

            xmlElement = $iq({
                to: xmlOrig.node.getAttribute('to'),
                id: xmlOrig.node.getAttribute('id') + ':sendIQ',
                type: 'set'
            });

            xmlElement.c('query', {
                xmlns: 'http://jabber.org/protocol/muc#admin'
            }).c('item', {
                nick: toUser,
                role: role,
            }).c('reason', {});
        }
        return Promise.resolve([message, xmlElement]);
    }
}
