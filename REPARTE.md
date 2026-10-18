# Reparte

Track **Pagos y remesas** · Ideatón Stellar Bolivia

**La remesa llega repartida en sobres.**

Demo: [stellar-ideathon.vercel.app](https://stellar-ideathon.vercel.app)

María manda 200 dólares desde Madrid. Su mamá en La Paz los necesita para tres cosas distintas: la casa, la matrícula y un fondo de salud. Hoy el giro llega como un solo monto. A los dos días la plata de la comida ya se usó y la cuota del colegio sigue sin pagar.

Reparte parte ese envío antes de que llegue. En una sola transacción de Stellar, 120 dólares caen en el sobre Casa, 60 en el sobre Colegio y 20 en el sobre Salud. Cada sobre es una cuenta distinta. El martes la mamá paga la matrícula escaneando el QR del colegio, directo desde el sobre Colegio, sin pasar por efectivo y sin tocar la plata de la casa.

## El problema

Quien recibe una remesa en Bolivia la usa primero para lo urgente: comida, pasaje, una deuda chica. La razón del envío —matrícula, alquiler, medicina— queda para después, y después el dinero ya no alcanza.

Quien envía no puede partir el giro. Western Union, MoneyGram o un conocido entregan un solo monto, cobran entre 6% y 8%, y no dejan un comprobante que separe las partes.

Quien cobra, el colegio o la tienda del barrio, recibe efectivo o una transferencia que tarda y no dice de qué remesa vino. No tiene una forma simple de cobrarle a una familia que recibe plata de afuera.

## Qué es Reparte

Una sola aplicación, tres pantallas, una por persona. No hay backend ni login: la app habla directo con la red de prueba de Stellar.

**Enviar (Madrid).** Quien envía elige a quién, el monto y cómo se reparte. El reparto de partida es Casa 60%, Colegio 30% y Salud 10%. La suma siempre da 100. Puede dejar un mensaje corto. Reparte arma una transacción con un pago por sobre, más una comisión del 1%, y la manda a la red.

**Billetera (La Paz).** Quien recibe ve el saldo real de cada sobre, leído de la red, y el historial de lo que llegó con su mensaje. Desde ahí paga un cobro o mueve plata de un sobre a otro, por ejemplo de Casa a Salud si sobró.

**Cobrar (el colegio).** El colegio arma un cobro con monto y concepto. La app lo convierte en un QR. La familia lo escanea, elige el sobre y paga. El colegio ve el pago llegar con el concepto, como comprobante.

El sobre Colegio está marcado para la cuota. Cuando el cobro es del colegio, la billetera lo propone primero. Así la matrícula no se mezcla con el gasto del día.

## Un envío, en números

| Parte | Monto | A dónde va |
|---|---:|---|
| Casa | 120 USDp | Cuenta del sobre Casa |
| Colegio | 60 USDp | Cuenta del sobre Colegio |
| Salud | 20 USDp | Cuenta del sobre Salud |
| Comisión Reparte | 2 USDp | Cuenta de Reparte |
| Total que sale de Madrid | 202 USDp | Una sola transacción |

El mensaje viaja en el memo: `REPARTE Matrícula marzo`. Cualquiera puede abrir el hash en [Stellar Expert](https://stellar.expert/explorer/testnet) y ver los cuatro pagos juntos. O llegan todos o no llega ninguno.

Después, el colegio genera un cobro de 60 por «Matrícula marzo». La mamá lo paga desde el sobre Colegio. Ese segundo pago es otra transacción, con su propio hash y el concepto en el memo.

Los bolivianos que muestra la app (6,95 Bs por dólar de prueba) son solo una referencia en pantalla. La red mueve `USDp`, no bolivianos.

## Por qué Stellar

- **Un envío, varios destinos, un hash.** La transacción lleva un pago por sobre y la comisión. Es atómica: no puede llegar la casa y perderse el colegio.
- **Un asset de la propia demo.** `USDp` lo emite la cuenta que envía. Las demás cuentas le abren trustline. Emisión, reparto y cobro pasan por la misma red. No es una etiqueta pintada en la interfaz.
- **El memo es el comprobante.** `REPARTE Matrícula marzo` en el envío y `Matrícula marzo` en el cobro. La familia y el colegio leen el concepto en la transacción, no en un servidor nuestro.
- **El QR es un estándar.** El cobro es un enlace `web+stellar:pay` (SEP-0007): destino, monto, asset y memo. No inventamos un formato de QR.
- **La comisión de red no se come el envío.** En 200 dólares alcanza para que Reparte cobre 1% y el colegio cobre gratis.
- **Se puede auditar.** Los dos hashes quedan públicos en testnet. El jurado no tiene que creerle a una captura.

## Cómo se sostiene

1% al enviar. Recibir es gratis. Cobrar es gratis.

Quien manda hoy pierde entre 6% y 8% y, además, no puede separar la cuota. Reparte cobra menos, entrega el dinero ya repartido y deja pagar el colegio sin efectivo.

La comisión no es un número en una lámina: es un pago más dentro de la misma transacción, hacia la cuenta de Reparte. Se ve en el hash.

Cuando una tienda quiera usar lo cobrado para pagarle a un proveedor de afuera, ese envío paga el mismo 1%. En esta demo ese paso todavía no está.

## Qué puede probar el jurado

1. Abrir [la demo](https://stellar-ideathon.vercel.app). La primera visita crea las cuentas de testnet sola. Tarda cerca de un minuto y después queda lista en ese navegador.
2. En **Enviar**, dejar 200 dólares con el reparto 60 · 30 · 10 y mandar. Sale el comprobante con el hash.
3. Abrir ese hash en Stellar Expert y contar los pagos: Casa, Colegio, Salud y la comisión.
4. En **Billetera**, ver los tres saldos y el envío en el historial, con el mensaje.
5. En **Cobrar**, generar un cobro. En la billetera, escanear o pegar ese cobro y pagarlo desde el sobre Colegio. Sale un segundo hash.

## Alcance de esta demo

Esto es una demo de testnet, no un servicio para mandar dólares de verdad.

- La red es Stellar testnet. `USDp` es un asset de prueba emitido por la cuenta de la demo. No es USDC y no se puede cambiar por bolivianos en un banco.
- No hay on-ramp ni off-ramp. Reparte no compra ni vende dólares. Mueve un saldo que ya está en la red.
- No hay backend, Soroban, anchor ni login. Los contactos viven en el navegador.
- En el sitio público, la primera visita crea seis cuentas con Friendbot y guarda las claves de prueba en ese navegador, para poder firmar el envío y los pagos sin pedir una extensión. En local se puede hacer lo mismo con `npm run cuentas`, que escribe un `.env`. Esas claves son solo de testnet.
- El candado de dos firmas del sobre Colegio (multisig: mamá en La Paz y hija en Madrid) y la liberación por fecha quedan para después. Hoy la separación es de cuentas: la cuota vive en otra cuenta, no en el mismo saldo de la casa.

## Qué sigue

- Probarlo con familias que ya reciben remesas y con colegios o tiendas que quieran dejar el efectivo.
- Entrar y salir de USDC con un proveedor regulado. Reparte sigue sin comprar ni vender dólares.
- Repetir el mismo reparto cada mes, el mismo día.
- Dejar que la tienda que cobró le pague a su proveedor del exterior desde la misma billetera.
- Cerrar el sobre Colegio con multisig y con fecha, para que la cuota no se pueda tocar antes del día de pago.

## Cómo está armado

Vite, React, `@stellar/stellar-sdk` y `qrcode`. Tailwind para la interfaz. Sirve en el celular y en la laptop.

```text
src/
├── App.jsx                  # Enviar · Billetera · Cobrar
├── config.js                # red, USDp, sobres, comisión, tasa referencial
├── features/
│   ├── enviar/              # monto, contacto, sobres, vista previa, comprobante
│   ├── billetera/           # saldos, historial, pagar, mover
│   └── cobrar/              # nuevo cobro, QR, recibidos
├── components/layout/       # barra lateral, encabezado, navegación
└── lib/
    ├── stellar.js           # enviar, pagar, mover, saldos, historial
    ├── split.js             # monto por sobre + comisión del 1%
    ├── sep7.js              # armar y leer web+stellar:pay
    ├── bootstrap.js         # crea las cuentas de testnet si no hay .env
    └── contacts.js          # libreta en el navegador
scripts/cuentas.mjs          # alternativa local: cuentas, Friendbot, trustlines, .env
```

Para correrlo en local:

```bash
npm install
npm run dev
```

Si no hay `.env`, la app crea las cuentas al abrirla. Si se quieren cuentas fijas en el archivo, `npm run cuentas` las genera y después hay que reiniciar `npm run dev`.
