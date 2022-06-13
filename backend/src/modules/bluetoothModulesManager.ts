import * as moment from 'moment';
import { timeout as withTimeout, TimeoutError } from 'promise-timeout';
import { PullBehavior } from 'pull-behavior';
import { Configuration } from '../config';
import { DeviceKind, ErrorResponse, BluetoothMinion, BluetoothMinionDevice, BluetoothMinionStatus } from '../models/sharedInterfaces';
import { MutexMinionsAccess } from '../utilities/mutex';
import { BluetoothBrandModuleBase } from './bluetoothBrandModuleBase';
import { SyncEvent } from 'ts-events';

///////////////////////////////////////////////////////////////////////////////
//////////////// TO EXTEND: Place here handler reference //////////////////////
///////////////////////////////////////////////////////////////////////////////
import { CommandsSet } from '../models/backendInterfaces';
import { STM32Handler } from './stm32/stm32Handler';
import { MockHandler } from './mock/mockHandler';
import { logger } from '../utilities/logger';

export class BluetoothModulesManager {
  /**
   * Get all devices kinds of all brands.
   */
  public get devicesKind(): DeviceKind[] {
    const modulesDevices: DeviceKind[] = [];
    for (const moduleHandler of this.modulesHandlers) {
      modulesDevices.push(...moduleHandler.devices);
    }
    return modulesDevices;
  }

  /**
   * Let subscribe to any status minion changed. from any brand module.
   */
  public minionStatusChangedEvent = new SyncEvent<{
    minionId: string;
    status: BluetoothMinionStatus;
  }>();

  /**
   * Allows to retrieve minions array. (used as proxy for all modulus).
   */
  public retrieveMinions: PullBehavior<BluetoothMinion[]> = new PullBehavior<BluetoothMinion[]>();
  private readonly COMMUNICATE_DEVICE_TIMEOUT = moment.duration(15, 'seconds');

  /**
   * All modules handlers
   */
  private modulesHandlers: BluetoothBrandModuleBase[] = [];

  constructor() {
    /** Currently, do not coverage modules, only 'mock' for other tests. */
    if (Configuration.runningMode === 'test') {
      this.initHandler(new STM32Handler());
      return;
    }

    this.initHandlers();
  }

  /**
   * Get current status of minion. (such as minion status on off etc.)
   */
  @MutexMinionsAccess
  public async getStatus(minion: BluetoothMinion): Promise<BluetoothMinionStatus | ErrorResponse> {
    const minionModule = this.getMinionModule(minion.device.brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${minion.device.brand}- brand`,
      };
      throw errorResponse;
    }

    try {
      logger.debug(
        `[BluetoothModulesManager.getStatus] getting minion "${minion.minionId}" status using "${minionModule.brandName}" module ...`,
      );
      const status = await withTimeout(
        minionModule.getStatus(minion),
        this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds(),
      );
      logger.debug(
        `[BluetoothModulesManager.getStatus] getting minion "${minion.minionId}" status "${JSON.stringify(status)}" succeed`,
      );
      return status;
    } catch (error) {
      logger.warn(
        `[BluetoothModulesManager.getStatus] getting minion "${minion.minionId}" status failed ${error.message ||
        JSON.stringify(error)}`,
      );

      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }

  /**
   * Get current status of minion. (such as minion status on off etc.)
   */
  @MutexMinionsAccess
  public async getBluetoothStatus(minion: BluetoothMinion): Promise<BluetoothMinionStatus | ErrorResponse> {
    const minionModule = this.getMinionModule(minion.device.brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${minion.device.brand}- brand`,
      };
      throw errorResponse;
    }

    try {
      logger.debug(
        `[BluetoothModulesManager.getStatus] getting minion "${minion.minionId}" status using "${minionModule.brandName}" module ...`,
      );
      const status = await withTimeout(
        minionModule.getStatus(minion),
        this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds(),
      );
      logger.debug(
        `[BluetoothModulesManager.getStatus] getting minion "${minion.minionId}" status "${JSON.stringify(status)}" succeed`,
      );
      return status;
    } catch (error) {
      logger.warn(
        `[BluetoothModulesManager.getStatus] getting minion "${minion.minionId}" status failed ${error.message ||
        JSON.stringify(error)}`,
      );

      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }

  /**
   * Set minion new status. (such as turn minion on off etc.)
   * @param minion minion to set status for.
   * @param setStatus the new status to set.
   */
  @MutexMinionsAccess
  public async setStatus(minion: BluetoothMinion, setStatus: BluetoothMinionStatus): Promise<void | ErrorResponse> {
    const minionModule = this.getMinionModule(minion.device.brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${minion.device.brand}- brand`,
      };
      throw errorResponse;
    }

    try {
      logger.debug(
        `[BluetoothModulesManager.setStatus] setting minion "${minion.minionId}" status "${JSON.stringify(setStatus)}" using "${minionModule.brandName
        }" module ...`,
      );
      await withTimeout(minionModule.setStatus(minion, setStatus), this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds());
      logger.debug(`[BluetoothModulesManager.setStatus] setting minion "${minion.minionId}" status succeed`);
    } catch (error) {
      logger.warn(
        `[BluetoothModulesManager.getStatus] setting minion "${minion.minionId}" status failed ${error.message ||
        JSON.stringify(error)}`,
      );
      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }


  /**
   * Record data for current minion status.
   * Note, only few devices models support this feature.
   * For example it is used when need to record IR data to math status for next use.
   * @param minion minion to record for.
   * @param statusToRecordFor the specific status to record for.
   */
  @MutexMinionsAccess
  public async enterRecordMode(minion: BluetoothMinion, statusToRecordFor: BluetoothMinionStatus): Promise<void | ErrorResponse> {
    const minionModule = this.getMinionModule(minion.device.brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${minion.device.brand}- brand`,
      };
      throw errorResponse;
    }

    /** Make sure that minion support recording */
    const modelKind = this.getModelKind(minionModule, minion.device);
    if (!modelKind || !modelKind.isRecordingSupported) {
      const errorResponse: ErrorResponse = {
        responseCode: 6409,
        message: `the minioin not support command recording or sending`,
      };
      throw errorResponse;
    }

    try {
      return await withTimeout(
        minionModule.enterRecordMode(minion, statusToRecordFor),
        this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds(),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }

  /**
   * Generate an RF or IR command for given status.
   * Note, only a few devices models support this feature.
   * For example, it is used to generate RF command to the RF wall switch, instead of buying remote and record the commands.
   * @param minion minion to generate for.
   * @param statusToGenerateFor the specific status to record for.
   */
  @MutexMinionsAccess
  public async generateCommand(minion: BluetoothMinion, statusToGenerateFor: BluetoothMinionStatus): Promise<void | ErrorResponse> {
    const minionModule = this.getMinionModule(minion.device.brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${minion.device.brand}- brand`,
      };
      throw errorResponse;
    }

    /** Make sure that minion supprt recording */
    const modelKind = this.getModelKind(minionModule, minion.device);
    if (!modelKind || !modelKind.isRecordingSupported) {
      const errorResponse: ErrorResponse = {
        responseCode: 6409,
        message: `the minioin not support command recording or sending`,
      };
      throw errorResponse;
    }

    try {
      return await withTimeout(
        minionModule.generateCommand(minion, statusToGenerateFor),
        this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds(),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }

  /**
   * Update the current module with fetched commands set.
   * see https://github.com/casanet/rf-commands-repo project API.
   * @param minion minioin to update commands by fetched commands set.
   * @param commandsSet Fetched RF commands set.
   */
  @MutexMinionsAccess
  public async setFetchedCommands(minion: BluetoothMinion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    const minionModule = this.getMinionModule(minion.device.brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${minion.device.brand}- brand`,
      };
      throw errorResponse;
    }

    /** Make sure that minion support recording */
    const modelKind = this.getModelKind(minionModule, minion.device);
    if (!modelKind || !modelKind.isFetchCommandsAvailable) {
      const errorResponse: ErrorResponse = {
        responseCode: 6409,
        message: `the minion not support command recording or sending`,
      };
      throw errorResponse;
    }

    try {
      return await withTimeout(
        minionModule.setFetchedCommands(minion, commandsSet),
        this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds(),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }
  /**
   * Refresh and reset all module communications.
   * Used for cleaning up communication before re-reading data, after communication auth changed or just hard reset module etc.
   */
  @MutexMinionsAccess
  public async refreshModules(): Promise<void> {
    for (const brandHandler of this.modulesHandlers) {
      try {
        await withTimeout(brandHandler.refreshCommunication(), this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds());
      } catch (error) { }
    }
  }

  /**
   * Reset module communication.
   * @param brand Brand module to reset.
   */
  @MutexMinionsAccess
  public async refreshModule(brand: string): Promise<void> {
    const minionModule = this.getMinionModule(brand);

    if (!minionModule) {
      const errorResponse: ErrorResponse = {
        responseCode: 7404,
        message: `there is not module for -${brand}- brand`,
      };
      throw errorResponse;
    }

    try {
      return await withTimeout(minionModule.refreshCommunication(), this.COMMUNICATE_DEVICE_TIMEOUT.asMilliseconds());
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw {
          responseCode: 1503,
          message: 'communication with device fail, timeout',
        } as ErrorResponse;
      }

      throw error;
    }
  }

  /**
   * Init any brand module in system.
   */
  private initHandlers(): void {
    ////////////////////////////////////////////////////////////////////////
    //////////////// TO EXTEND: Init here new handler //////////////////////
    ////////////////////////////////////////////////////////////////////////
    this.initHandler(new STM32Handler());
  }

  /**
   * Hold the hendler instance and registar to minions status changed.
   * @param brandModule the handler instance.
   */
  private initHandler(brandModule: BluetoothBrandModuleBase): void {
    /**
     * Set pull proxy method to get all last minions array.
     */
    brandModule.retrieveMinions.setPullMethod(
      async (): Promise<BluetoothMinion[]> => {
        if (!this.retrieveMinions.isPullingAvailble) {
          return [];
        }
        return await this.retrieveMinions.pull();
      },
    );

    brandModule.minionStatusChangedEvent.attach(changedMinionStatus => {
      this.minionStatusChangedEvent.post(changedMinionStatus);
    });

    this.modulesHandlers.push(brandModule);
  }

  /**
   * Get minion communication module based on brand name.
   * @param brandName the brand name.
   * @returns The module instance or undefined if not exist.
   */
  private getMinionModule(brandName: string): BluetoothBrandModuleBase {
    for (const brandHandler of this.modulesHandlers) {
      if (brandName === brandHandler.brandName) {
        return brandHandler;
      }
    }
  }

  /**
 * Get minion communication module based on brand name.
 * @param brandName the brand name.
 * @returns The module instance or undefined if not exist.
 */
  private getBluetoothMinionModule(brandName: string): BluetoothBrandModuleBase {
    for (const brandHandler of this.modulesHandlers) {
      if (brandName === brandHandler.brandName) {
        return brandHandler;
      }
    }
  }

  /**
   * Get DeviceKind of minion device.
   * @param minionsBrandModuleBase The rand module to look in.
   * @param minionDevice the minion device to get kind for.
   * @returns The device kind.
   */
  private getModelKind(minionsBrandModuleBase: BluetoothBrandModuleBase, minionDevice: BluetoothMinionDevice): DeviceKind {
    for (const deviceKind of minionsBrandModuleBase.devices) {
      if (deviceKind.brand === minionDevice.brand && deviceKind.model === minionDevice.model) {
        return deviceKind;
      }
    }
  }
}

export const BluetoothModulesManagerSingltone = new BluetoothModulesManager();
