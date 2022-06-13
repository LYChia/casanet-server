import * as path from 'path';
import { PullBehavior } from 'pull-behavior';
import { SyncEvent } from 'ts-events';
import { Configuration } from '../config';
import { AcCommands, CommandsSet, RollerCommands, ToggleCommands } from '../models/backendInterfaces';
import { DeviceKind, ErrorResponse, BluetoothMinion, BluetoothMinionStatus } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

export const CACHE_DIRECTORY = path.join('./data/', Configuration.runningMode, '/cache/');

/**
 * Any smart devices brand communication module needs to inherit..
 */
export abstract class BluetoothBrandModuleBase {
  /**
   * Cache file pull path.
   */
  protected get cacheFilePath(): string {
    return `${path.join(CACHE_DIRECTORY, this.brandName)}.json`;
  }

  /**
   * Brand name, should be unique in system.
   */
  public abstract readonly brandName: string;

  /**
   * All supported devices via current module metadata.
   */
  public abstract readonly devices: DeviceKind[];

  /**
   * Let minions manager to know if any minion status changed by physical interface of device.
   */
  public minionStatusChangedEvent = new SyncEvent<{
    minionId: string;
    status: BluetoothMinionStatus;
  }>();

  /**
   * This PullBehavior Allows to retrieve minions array.
   * Used when new status arrived and need all minions array to know for witch minion update belong.
   * some of is by mac some by other data.
   */
  public retrieveMinions: PullBehavior<BluetoothMinion[]> = new PullBehavior<BluetoothMinion[]>();

  /**
   * Get current status of minion. (such as minion status on off etc.)
   * @param minion minion to get status for.
   */
  public abstract getStatus(minion: BluetoothMinion): Promise<BluetoothMinionStatus | ErrorResponse>;

  /**
   * Set minion new status. (such as turn minion on off etc.)
   * @param minion minion to set status for.
   * @param setStatus the new status to set.
   */
  public abstract setStatus(minion: BluetoothMinion, setStatus: BluetoothMinionStatus): Promise<void | ErrorResponse>;


  /**
   * Record data for currrent minion status.
   * Note, only a few devices models support this feature.
   * For example it is used when need to record IR data to math status for next use.
   * @param minion minion to record for.
   * @param statusToRecordFor the specific status to record for.
   */
  public abstract enterRecordMode(minion: BluetoothMinion, statusToRecordFor: BluetoothMinionStatus): Promise<void | ErrorResponse>;

  /**
   * Generate an RF or IR command for given status.
   * Note, only a few devices models support this feature.
   * For example, it is used to generate RF command to the RF wall switch, instead of buying remote and record the commands.
   * @param minion minion to generate for.
   * @param statusToGenerateFor the specific status to record for.
   */
  public abstract generateCommand(minion: BluetoothMinion, statusToGenerateFor: BluetoothMinionStatus): Promise<void | ErrorResponse>;

  /**
   * Update module with commands set, instead of recording on by one by the end user.
   * see https://github.com/casanet/rf-commands-repo project API.
   * @param minion minioin to update commands by fetched commands set.
   * @param commandsSet Fetched RF commands set.
   */
  public abstract setFetchedCommands(minion: BluetoothMinion, commandsSet: CommandsSet): Promise<void | ErrorResponse>;

  /**
   * Refresh and reset all module communications.
   * Used for cleaning up communication before re-reading data, after communication auth changed or just hard reset module etc.
   */
  public abstract refreshCommunication(): Promise<void>;
}
