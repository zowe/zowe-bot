/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { Activity, Attachment, ChannelInfo } from 'botbuilder';
import { BotActivityHandler } from '../../../../src/plugins/msteams/BotActivityHandler';
import { MsteamsMiddleware } from '../../../../src/plugins/msteams/MsteamsMiddleware';
import { IMessage, IMessageType } from '../../../../src/types';
import { MockCommonBot } from '../../../common/mocks/MockCommonBot';

describe('MsTeams Middleware Tests', () => {
  // TODO: This is a copy of structure in source, remove it? Remove tests?
  type MessageData = {
    textMessage?: string;
    mentions?: Record<string, any>;
    attachments?: Attachment[];
  };

  const middlewareMock: {
    botActivityHandler: BotActivityHandler;
    buildActivity: (msgData: MessageData) => Partial<Activity>;
    processMessages: (messages: IMessage[]) => MessageData;
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
});
