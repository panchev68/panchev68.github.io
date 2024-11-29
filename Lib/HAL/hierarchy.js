var hierarchy =
[
    [ "ADC_ChannelConfTypeDef", null, [
      [ "Lib::HAL::Adc::Channel", "de/dc2/a00228.html", [
        [ "Lib::HAL::Adc::PortBase", "d7/d40/a00236.html", [
          [ "Lib::HAL::Adc::Port< DriverMode::BLOCK >", "dc/ded/a00252.html", null ],
          [ "Lib::HAL::Adc::PortTransparentBase", "d6/d08/a00244.html", [
            [ "Lib::HAL::Adc::Port< DMA >", "d0/def/a00256.html", null ],
            [ "Lib::HAL::Adc::Port< IT >", "dd/dd7/a00260.html", null ]
          ] ]
        ] ]
      ] ]
    ] ],
    [ "Lib::HAL::I2C::Master::Base", "d8/d8e/a00344.html", [
      [ "Lib::HAL::I2C::Master::Port< BLOCK >", "df/df1/a00340.html", null ],
      [ "Lib::HAL::I2C::Master::TransperentBase", "d6/d9c/a00352.html", [
        [ "Lib::HAL::I2C::Master::Port< DMA >", "d0/d65/a00360.html", null ],
        [ "Lib::HAL::I2C::Master::Port< IT >", "dc/d59/a00364.html", null ]
      ] ]
    ] ],
    [ "Lib::HAL::TIM::Base", "d9/d72/a00412.html", [
      [ "Lib::HAL::TIM::Timer< Mode::ENCODER >", "d4/dd3/a00428.html", null ]
    ] ],
    [ "CAN_FilterTypeDef", null, [
      [ "Lib::HAL::CAN::Filter", "dc/d28/a00276.html", null ]
    ] ],
    [ "CAN_RxHeaderTypeDef", null, [
      [ "Lib::HAL::CAN::RxMessage", "da/ddc/a00288.html", null ]
    ] ],
    [ "CAN_TxHeaderTypeDef", null, [
      [ "Lib::HAL::CAN::TxHeader", "d8/d0a/a00292.html", [
        [ "Lib::HAL::CAN::TxMessage", "db/d7b/a00296.html", null ]
      ] ]
    ] ],
    [ "System::Tick::ClientBase", null, [
      [ "Lib::HAL::RTClock", "d8/ddd/a00380.html", null ]
    ] ],
    [ "Lib::Helper::Container", null, [
      [ "Lib::HAL::DeviceManagerBase< PortTransparentBase, ADC_HandleTypeDef >", "d0/dcd/a00280.html", null ],
      [ "Lib::HAL::DeviceManagerBase< PortBase, CAN_HandleTypeDef >", "d0/dcd/a00280.html", [
        [ "Lib::HAL::CAN::DeviceManager", "d9/dd6/a00272.html", null ]
      ] ],
      [ "Lib::HAL::DeviceManagerBase< ExtInterrupt, uint16_t >", "d0/dcd/a00280.html", [
        [ "Lib::HAL::GPIO::ExtInterrupt::DeviceManager", "dd/de2/a00320.html", null ]
      ] ],
      [ "Lib::HAL::DeviceManagerBase< TransperentBase, I2C_HandleTypeDef >", "d0/dcd/a00280.html", [
        [ "Lib::HAL::I2C::Master::TransperentBase::DeviceManager", "d6/de1/a00356.html", null ]
      ] ],
      [ "Lib::HAL::DeviceManagerBase< TransperentBase, SPI_HandleTypeDef >", "d0/dcd/a00280.html", null ],
      [ "Lib::HAL::DeviceManagerBase< Base, TIM_HandleTypeDef >", "d0/dcd/a00280.html", [
        [ "Lib::HAL::TIM::Base::DeviceManager", "df/d15/a00416.html", null ]
      ] ],
      [ "Lib::HAL::DeviceManagerBase< TransperentBase, UART_HandleTypeDef >", "d0/dcd/a00280.html", null ],
      [ "Lib::HAL::DeviceManagerBase< T_DEVICE, T_HANDLE >", "d0/dcd/a00280.html", null ]
    ] ],
    [ "Lib::HAL::BKPSRAM::Domain", "d3/dcc/a00264.html", null ],
    [ "Lib::HAL::BKPSRAM::Driver", "db/d12/a00268.html", null ],
    [ "Lib::HAL::GPIO::Handle", "d4/d8f/a00324.html", [
      [ "Lib::HAL::GPIO::Pin< Type::INPUT >", "d4/db5/a00328.html", [
        [ "Lib::HAL::GPIO::Pin< Type::OUTPUT >", "dc/d50/a00332.html", null ]
      ] ]
    ] ],
    [ "Lib::HAL::Handle< T_HANDLE >", "d8/d17/a00304.html", null ],
    [ "Lib::HAL::Timer::Handle", "db/d4f/a00420.html", null ],
    [ "Lib::HAL::Handle< ADC_HandleTypeDef >", "d8/d17/a00304.html", [
      [ "Lib::HAL::Adc::Interface", "d0/d53/a00232.html", [
        [ "Lib::HAL::Adc::PortBase", "d7/d40/a00236.html", null ]
      ] ]
    ] ],
    [ "Lib::HAL::Handle< CAN_HandleTypeDef >", "d8/d17/a00304.html", [
      [ "Lib::HAL::CAN::PortBase", "db/dc3/a00284.html", [
        [ "Lib::HAL::CAN::Port", "db/da2/a00300.html", null ]
      ] ]
    ] ],
    [ "Lib::HAL::Handle< SPI_HandleTypeDef >", "d8/d17/a00304.html", [
      [ "Lib::HAL::SPI::Master::Base", "d9/dc1/a00388.html", [
        [ "Lib::HAL::SPI::Master::Port< BLOCK >", "d2/d56/a00384.html", null ],
        [ "Lib::HAL::SPI::Master::TransperentBase", "d9/da1/a00396.html", [
          [ "Lib::HAL::SPI::Master::Port< DMA >", "d9/de6/a00404.html", null ],
          [ "Lib::HAL::SPI::Master::Port< IT >", "dd/dea/a00408.html", null ]
        ] ]
      ] ]
    ] ],
    [ "Lib::HAL::Handle< UART_HandleTypeDef >", "d8/d17/a00304.html", [
      [ "Lib::HAL::UART::Base", "d9/dd5/a00432.html", [
        [ "Lib::HAL::UART::TransperentBase", "de/df8/a00440.html", [
          [ "Lib::HAL::UART::Port< DMA >", "de/dfe/a00448.html", null ],
          [ "Lib::HAL::UART::Port< IT >", "d1/d0b/a00452.html", null ]
        ] ]
      ] ]
    ] ],
    [ "Lib::HAL::Handle< uint16_t >", "d8/d17/a00304.html", [
      [ "Lib::HAL::GPIO::ExtInterrupt", "d3/db8/a00316.html", null ]
    ] ],
    [ "Lib::HAL::LastResetState", "db/d7e/a00372.html", null ],
    [ "Lib::HAL::GPIO::Mode", "d5/d0f/a00308.html", [
      [ "Lib::HAL::GPIO::Pin< Type::INPUT >", "d4/db5/a00328.html", null ]
    ] ],
    [ "Lib::HAL::OTP", "d6/db8/a00376.html", null ],
    [ "Lib::HAL::GPIO::Pin< Type >", "d7/df2/a00312.html", [
      [ "Lib::HAL::GPIO::ExtInterrupt", "d3/db8/a00316.html", null ]
    ] ],
    [ "Lib::HAL::Adc::Port< DriverMode >", "d9/d21/a00240.html", null ],
    [ "Lib::HAL::GPIO::Port", "dd/d1d/a00336.html", null ],
    [ "Lib::HAL::I2C::Master::Port< DriverMode >", "df/d03/a00348.html", null ],
    [ "Lib::HAL::SPI::Master::Port< DriverMode >", "d4/d27/a00392.html", null ],
    [ "Lib::HAL::UART::Port< DriverMode >", "d4/d82/a00436.html", null ],
    [ "Lib::HAL::TIM::Timer< Mode >", "dc/df3/a00424.html", null ],
    [ "Lib::HAL::Watchdog", "d8/d21/a00368.html", null ]
];