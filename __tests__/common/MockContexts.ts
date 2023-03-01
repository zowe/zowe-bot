/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { CommonBot } from '../../src/CommonBot';
import { IChatContextData, IChattingType, IPayloadType, IUser } from '../../src/types';

export class MockContexts {
  private static mockUser: IUser = {
    id: '123abc_def',
    name: 'mock_user',
    email: 'mock_user@mocks.me',
  };

  /**
   * Provides a simple Mattermost bot with all fields populated by some mocked defaults.
   *
   * Automation wishing to test specific IChatContextData values should use this as a base and then modify the respective properties
   *
   * @param bot
   * @returns
   */
  static SIMPLE_MM_CTX: IChatContextData = {
    payload: {
      type: IPayloadType.MESSAGE,
      data: 'mock_message',
    },
    context: {
      chatting: {
        bot: {} as CommonBot,
        type: IChattingType.PUBLIC_CHANNEL,
        user: this.mockUser,
        channel: { name: 'mock_chan', id: '123_team_chan_321' },
        tenant: { name: 'mock_tenant', id: '123_mock_tentant_id_321' },
        team: { name: 'mock_team', id: '123_mock_team_id_321' },
      },
      chatTool: {
        rootId: 'mock_root_id',
      },
    },
  };
}
