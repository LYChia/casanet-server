import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Path,
    Post,
    Put,
    Query,
    Response,
    Route,
    Security,
    SuccessResponse,
    Tags,
} from 'tsoa';
import { DevicesBlSingleton } from '../business-layer/devicesBl';
import { BluetoothDevicesBlSingleton } from '../business-layer/bluetoothDeviceBl';
import { BluetoothDevice, DeviceKind, ErrorResponse, LocalNetworkDevice } from '../models/sharedInterfaces';

@Tags('Devices')
@Route('devices')
export class DevicesController extends Controller {
    /**
     * Get all bluetooth devices in the local network.
     * @returns Local network devices array.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get("bluetooth")
    public async getBluetoothDevices(): Promise<BluetoothDevice[]> {
        // to-do : 回傳找到的所有藍牙裝置
        return await BluetoothDevicesBlSingleton.getDevices();
    }

    /**
     * Configure a device.
     * @param uuid Device uuid.
     * @param newName The name to set.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('bluetooth/{uuid}')
    public async setBluetoothDeviceConfig(uuid: string, @Body() device: BluetoothDevice): Promise<void> {
        // to-do : 跟藍牙控制器溝通，設定指定藍牙裝置
        device.uuid = uuid;
        await BluetoothDevicesBlSingleton.setDeviceName(device);
    }


    /**
    * Get specific bluetooth device(s) detail.
    * @param uuids Device(s) uuid (split with comma).
    * @returns Bluetooth devices detail information.
    */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get("bluetooth/detail/{uuids}")
    public async getBluetoothDeviceDetail(uuids: string): Promise<BluetoothDevice[]> {
        // to-do : 回傳找到的指定藍牙裝置訊息 (eg.設定溫度閥值為多少)
        return await BluetoothDevicesBlSingleton.getDevices();
    }

    /**
     * Rescan all devices in LAN.
     * Used when there are changes in the local network.
     * For example, if the router (DHCP server) change IP's of devices or new device connect to the local network etc.
     */
     @Security('userAuth')
     @Security('adminAuth')
     @Response<ErrorResponse>(501, 'Server error')
     @Post('bluetooth/rescan')
     public async rescanBluetoothDevices(): Promise<void> {
         await BluetoothDevicesBlSingleton.rescanBluetooth();
     }


    /**
     * Get all devices in the local network.
     * @returns Local network devices array.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getDevices(): Promise<LocalNetworkDevice[]> {
        return await DevicesBlSingleton.getDevices();
    }

    /**
     * Get all supported devices kind info.
     * @returns Local network devices array.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('kinds')
    public async getDevicesKinds(): Promise<DeviceKind[]> {
        return await DevicesBlSingleton.getDevicesKins();
    }

    /**
     * Set name to a device.
     * @param deviceMac Device mac address.
     * @param newName The name to set.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{deviceMac}')
    public async setDeviceName(deviceMac: string, @Body() device: LocalNetworkDevice): Promise<void> {
        device.mac = deviceMac;
        await DevicesBlSingleton.setDeviceName(device);
    }

    /**
     * Rescan all devices in LAN.
     * Used when there are changes in the local network.
     * For example, if the router (DHCP server) change IP's of devices or new device connect to the local network etc.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('rescan')
    public async rescanDevices(): Promise<void> {
        await DevicesBlSingleton.rescanNetwork();
    }
}
