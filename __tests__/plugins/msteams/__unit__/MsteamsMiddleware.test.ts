/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Activity, Attachment, BotFrameworkAdapter } from 'botbuilder';
import { BotActivityHandler } from '../../../../src/plugins/msteams/BotActivityHandler';
import { MsteamsMiddleware } from '../../../../src/plugins/msteams/MsteamsMiddleware';
import { IChatContextData, IMessage, IMessageType } from '../../../../src/types';
import { MockCommonBot } from '../../../common/mocks/MockCommonBot';
import { MockContexts } from '../../../common/mocks/MockContexts';
import { MsteamsConstants } from '../../../common/msteams/MsteamsConstants';
// eslint-disable-next-line node/no-extraneous-import
import { ConnectorClient } from 'botframework-connector'; // required, secondary import by botbuilder

describe('MsTeams Middleware Tests', () => {
  // TODO: This is a copy of structure in source, remove it? Remove tests?
  type MessageData = {
    textMessage?: string;
    mentions?: Record<string, any>;
    attachments?: Attachment[];
  };

  const middlewareMock: {
    botActivityHandler: BotActivityHandler;
    botFrameworkAdapter: BotFrameworkAdapter;
    buildActivity: (msgData: MessageData) => Partial<Activity>;
    processMessages: (messages: IMessage[]) => MessageData;
    sendDirectMessage: (chatContextData: IChatContextData, messages: IMessage[]) => Promise<boolean>;
  } = new MsteamsMiddleware(MockCommonBot.MSTEAMS_BOT) as any;

  it('MsTeams buildActivity', async () => {
    const testCases: MessageData[] = [
      {
        textMessage: 'test',
      },
      {
        textMessage: 'two',
        mentions: { user: 'mock_user' },
      },
      {
        attachments: [
          {
            contentType: 'mimetype/gif',
            content: 'abcdef',
          },
        ],
      },
      {
        textMessage: '',
        attachments: [
          {
            contentType: 'mimetype/gif',
            content: 'abcdef',
          },
        ],
      },
      {
        textMessage: 'with a text message',
        attachments: [
          {
            contentType: 'mimetype/gif',
            content: 'abcdef',
          },
        ],
      },
      {
        attachments: [
          {
            contentType: 'mimetype/gif',
            content: 'abcdef',
          },
        ],
        mentions: { user: 'mock_user' },
      },
      {
        textMessage: '',
        mentions: { user: 'mock_user' },
      },
    ];

    for (const message of testCases) {
      const activ = middlewareMock.buildActivity(message);
      expect(activ).toMatchSnapshot();
    }
  });

  it('MSTeams processMessages', async () => {
    // Basic test cases
    const testCases: IMessage[][] = [
      [
        { type: IMessageType.PLAIN_TEXT, message: 'hi' },
        { type: IMessageType.PLAIN_TEXT, message: 'over' },
      ],
      [
        { type: IMessageType.PLAIN_TEXT, message: 'there', mentions: [{ mentioned: { id: 'mock_id' } }] },
        { type: IMessageType.PLAIN_TEXT, message: 'name', mentions: [{ mentioned: { id: 'another_id', name: 'mock_name' } }] },
      ],
      [{ type: IMessageType.PLAIN_TEXT, message: 'there', mentions: [{ mentioned: { id: '', name: 'mock_name' } }] }],
      [{ type: IMessageType.MSTEAMS_DIALOG_OPEN, message: 'open the dialog', mentions: [{ mentioned: { id: 'mock_id' } }] }],
      [],
    ];

    for (const test of testCases) {
      const msgData = middlewareMock.processMessages(test);
      expect(msgData).toMatchSnapshot();
    }

    // Cases where there's valid channelIds
    middlewareMock.botActivityHandler.findChannelByName = jest.fn((name) => {
      return { id: 'mocked_found_id', name: name + '_echo' };
    });

    middlewareMock.botActivityHandler.findChannelById = jest.fn((id) => {
      return { id: id + '_echo', name: 'mocked_found_name' };
    });

    for (const test of testCases) {
      const msgData = middlewareMock.processMessages(test);
      expect(msgData).toMatchSnapshot();
    }
  });

  describe('SendDirectMessage', () => {
    // context may be modified in tests, store and restore it
    const origSimpleCtx = MockContexts.MSTEAMS_SIMPLE_CTX;

    const testCases: IMessage[][] = [
      [
        { type: IMessageType.PLAIN_TEXT, message: 'hi' },
        { type: IMessageType.PLAIN_TEXT, message: 'over' },
      ],
      [{ type: IMessageType.PLAIN_TEXT, message: '' }],
      [{ type: IMessageType.MSTEAMS_ADAPTIVE_CARD, message: MsteamsConstants.EMPTY_ADAPTIVE_CARD }],
      [
        { type: IMessageType.MSTEAMS_ADAPTIVE_CARD, message: MsteamsConstants.EMPTY_ADAPTIVE_CARD },
        { type: IMessageType.PLAIN_TEXT, message: 'follow-up message' },
      ],
      [{ type: IMessageType.MSTEAMS_DIALOG_OPEN, message: 'TODO: dialog open' }],
      [],
    ];

    beforeEach(() => {
      MockContexts.MSTEAMS_SIMPLE_CTX = origSimpleCtx;
      const mockConnector: ConnectorClient = { conversations: { createConversation: () => {}, sendToConversation: () => {} } } as any;
      jest.spyOn(mockConnector.conversations, 'createConversation').mockImplementation(() => {
        return { id: 'mock_convo_id' };
      });
      jest.spyOn(mockConnector.conversations, 'sendToConversation').mockReturnValue();
      const mockMap = new Map<string, string>();
      mockMap.set('abc', 'def');
      jest.spyOn(middlewareMock.botActivityHandler, 'getServiceUrl').mockReturnValue(mockMap);
      jest.spyOn(middlewareMock.botActivityHandler, 'findChannelByName').mockReturnValue({ id: 'mock_chan_id', name: 'mock_name' });
      jest.spyOn(middlewareMock.botActivityHandler, 'findChannelById').mockReturnValue({ id: 'mock_chan_id', name: 'mock_name' });
      jest.spyOn(middlewareMock.botActivityHandler, 'findServiceUrl').mockReturnValue('mock_svc_url');
      jest.spyOn(middlewareMock.botFrameworkAdapter, 'createConnectorClient').mockReturnValue(mockConnector);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    // by default, w/ beforeEach all cases are good.
    it('Success cases', async () => {
      for (const test of testCases) {
        const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(true);
      }
    });

    // --------
    // modify conditions to trigger various failures/branches below
    // --------
    it('getServiceUrl empty', async () => {
      jest.spyOn(middlewareMock.botActivityHandler, 'getServiceUrl').mockReturnValue(new Map());
      for (const test of testCases) {
        const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
    });

    it('empty channel name and id => findChannelById', async () => {
      // clone ctx, we'll be modifying it in test
      const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;
      ctx.context.chatting.channel.id = '';
      ctx.context.chatting.channel.name = '';
      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(true);
      }
    });

    it('condition findChannelByName', async () => {
      const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;
      ctx.context.chatting.channel.id = '';
      ctx.context.chatting.channel.name = 'mock_name';

      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(true);
      }
      jest.spyOn(middlewareMock.botActivityHandler, 'findChannelByName').mockReturnValue({ id: null! });

      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
    });

    it('channel info returns empty', async () => {
      const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;
      jest.spyOn(middlewareMock.botActivityHandler, 'findChannelById').mockReturnValue(null!);

      ctx.context.chatTool.context = null;
      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
      ctx.context.chatTool.context = { _activity: null };
      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
      ctx.context.chatTool.context._activity = { serviceUrl: null };

      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }

      ctx.context.chatTool.context._activity.serviceUrl = 'some_svc_url';
      ctx.context.chatTool.context._activity.recipient = 'bot_id'; // incidentially nuked by nulling 'above' paths

      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(true);
      }
    });

    it('empty or null serviceUrl', async () => {
      const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;
      jest.spyOn(middlewareMock.botActivityHandler, 'findServiceUrl').mockReturnValue(null!);

      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
    });

    it('empty msteams _activity.recipient', async () => {
      const ctx: IChatContextData = MockContexts.MSTEAMS_SIMPLE_CTX;

      ctx.context.chatTool.context = null;
      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }

      ctx.context.chatTool.context = { _activity: null };
      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
      ctx.context.chatTool.context._activity = { recipient: null };
      for (const test of testCases) {
        const sent = await middlewareMock.sendDirectMessage(ctx, test);
        expect(sent).toBe(false);
      }
    });
  });
});
