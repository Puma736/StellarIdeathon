# Reparte

Track: **Pagos y remesas** · Ideatón Stellar Bolivia · 17 y 18 de octubre

Billetera de remesas con sobres. La plata sale de Madrid en una sola transacción de Stellar y llega a La Paz ya repartida en sobres: uno para la casa, uno para el colegio, uno para la salud. Cada sobre es una cuenta distinta en la red. Desde la billetera, la familia paga el colegio o la tienda con un QR, sin pasar por efectivo.

## La escena

La hermana en Madrid manda 200 dólares. En La Paz, 120 caen en el sobre Casa, 60 en el sobre Colegio y 20 en el sobre Salud. El martes la mamá paga la matrícula escaneando el QR del colegio, directo desde el sobre Colegio. El giro tradicional entrega un solo fajo en una ventanilla. A las 48 horas la plata ya se gastó y la cuota sigue debiendo.

Frase de pitch:

> El martes llegaron 200 dólares de Madrid. El jueves no quedaba nada, y la matrícula de marzo sigue sin pagar. Reparte manda la plata ya repartida y deja pagar el colegio sin tocar el sobre de la casa.

## Problema

Quien recibe una remesa en Bolivia la usa para lo urgente: comida, pasaje, una deuda chica. La meta que justificó el envío (matrícula, alquiler, medicina) se queda para después, y después el boliviano ya no alcanza.

El que envía no puede partir el giro. Western Union, MoneyGram o un conocido entregan un solo monto, cobran entre 6% y 8%, y no dejan un comprobante que separe las partes.

El que cobra (el colegio, la tienda del barrio, la farmacia) recibe efectivo o una transferencia bancaria que tarda y no dice de qué remesa vino. No tiene forma simple de cobrar a una familia que recibe plata de afuera.

## Usuarios

Tres personas alrededor del mismo envío:

1. **Quien envía.** Persona boliviana que vive en España, Argentina, Chile o Brasil y manda plata cada mes.
2. **Quien recibe.** La mamá, el papá o la pareja en La Paz, El Alto, Santa Cruz o Cochabamba. Usa la billetera desde el celular.
3. **Quien cobra.** El colegio, la tienda, la farmacia. Pequeño comercio que quiere cobrar sin efectivo y sin comisión.

No es «el mercado de remesas». Es una familia, un colegio y un número.

## Solución

Reparte tiene tres pantallas, una por persona:

**Enviar (Madrid).** Quien envía elige el monto, a quién y cómo se reparte en sobres. Ejemplo: 200 dólares, mamá, Casa 60% · Colegio 30% · Salud 10%. Puede escribir un mensaje corto que viaja en la transacción. Reparte arma **una** transacción con un pago por sobre y memo `REPARTE`.

**Billetera (La Paz).** Quien recibe ve sus sobres con saldo real leído de la red, el historial de envíos con el mensaje de cada uno, y un botón para pagar. El sobre Colegio solo se usa para pagar al colegio: la cuota no entra al gasto del día.

**Cobrar (el colegio).** Quien cobra genera un cobro: monto, concepto, QR. La familia lo escanea desde la billetera, elige el sobre y paga. El colegio ve el pago llegar con el concepto como comprobante.

Comprar o vender dólares queda fuera del producto. Reparte solo mueve un envío que ya está en USDC. En la demo de testnet se paga con `USDp`, un asset de prueba emitido por la propia cuenta emisora.

## Funciones

Marcadas por lo que está hecho, lo que entra el domingo y lo que queda después. Si no está en estas listas, no se construye.

### Listo

- Formulario de envío: monto, nombre, porcentaje para la cuota, vista previa.
- Una transacción con dos pagos en `USDp` a dos cuentas distintas y memo `REPARTE`.
- Dos tarjetas con los montos y el enlace al hash en Stellar Expert.
- Script que crea las cuentas de testnet, las fondea y abre trustlines.

### Domingo

**Enviar**

- Sobres en lugar de un solo porcentaje: Casa, Colegio, Salud. Cada uno con su porcentaje. La suma siempre da 100.
- Mensaje corto que viaja en el memo junto al marcador (`REPARTE Matrícula marzo`, hasta 28 bytes).
- Libreta de contactos: guardar a quién se envía con sus sobres, para no cargar la cuenta cada mes.
- Comisión del 1% como tercera operación en la misma transacción, hacia la cuenta de Reparte. El modelo queda escrito en la red, no en una slide.
- Comprobante para compartir por WhatsApp: montos por sobre, mensaje y enlace al hash.

**Billetera**

- Saldos reales por sobre, leídos de Horizon. En dólares de prueba y en bolivianos referenciales con una tasa fija marcada como referencial.
- Historial de envíos recibidos: fecha, quién mandó, mensaje, montos por sobre, enlace al hash.
- Pagar desde un sobre: pegar o escanear un cobro, elegir el sobre, confirmar. Un pago de Stellar con el concepto en el memo.
- Mover entre sobres: de Casa a Salud si sobró. Un pago entre las cuentas de la misma familia.

**Cobrar**

- Generar cobro: monto, concepto, QR. Es un enlace `web+stellar:pay` (SEP-0007) con destino, monto, asset y memo.
- Lista de cobros recibidos con el concepto y el hash. El colegio ve quién pagó qué.

### Si sobra la tarde

- Candado del sobre Colegio: la cuenta pide dos firmas para pagar (mamá en La Paz, hija en Madrid). La mamá pide pagar la matrícula, la hija aprueba desde su pantalla, el pago sale. Es multisig de Stellar, no una regla de la app.

### Después del domingo

- Envío recurrente: cada mes el día 5, mismo reparto.
- On-ramp y off-ramp con un proveedor regulado. Reparte no compra ni vende dólares.
- Pago a proveedores del exterior desde la pantalla Cobrar: la tienda que recibe en `USDp` paga a su proveedor en Chile con la misma billetera.
- Liberación por fecha del sobre Colegio (`timebounds`), para que la cuota no pueda tocarse antes del día de pago.

## Por qué Stellar

- Un envío, varios destinos, un hash. El jurado abre la transacción y ve un pago por sobre más la comisión, todos en la misma operación atómica. O llegan todos o no llega ninguno.
- El pago sale en `USDp`, un asset emitido por la demo: emisión, trustlines, split y cobros en la misma red. Es Stellar de verdad, no una etiqueta en pantalla.
- La comisión de red no mueve la aguja en un envío de 200 dólares. Alcanza para que Reparte cobre 1% y el comercio cobre gratis.
- El memo guarda el pedido: `REPARTE Matrícula marzo` en el envío, `Matrícula marzo` en el cobro. Comprobante para la familia y para el colegio.
- `web+stellar:pay` (SEP-0007) es el estándar para cobrar con QR. No hay que inventar un formato.
- Multisig nativo: el candado del sobre Colegio son dos firmas en la cuenta, no una regla en el servidor.
- Las cuentas de prueba en testnet bastan para mostrar el flujo. Friendbot las fondea. No hace falta un banco en el medio para la demo.

URL del comprobante:

`https://stellar.expert/explorer/testnet/tx/HASH`

## Producto

Una sola app. Tres pantallas, una por persona. Se cambia de pantalla con pestañas arriba: Enviar · Billetera · Cobrar.

### 1. Enviar (Madrid)

- A quién: contacto guardado o nombre nuevo.
- Monto total.
- Sobres con porcentaje: Casa, Colegio, Salud. Default 60 · 30 · 10. Se puede quitar o agregar un sobre.
- Mensaje corto.
- Vista previa: «120 Casa · 60 Colegio · 20 Salud · comisión 2».
- Botón: construye, firma y envía la transacción de testnet. Para el video, la firma la hace la cuenta de prueba ya fondeada, así la grabación no depende de una extensión.
- Al salir: comprobante con el hash y botón para compartir.

### 2. Billetera (La Paz)

- Tarjetas por sobre con saldo en dólares de prueba y en bolivianos referenciales.
- Botones: Pagar · Mover.
- Historial: cada envío con fecha, mensaje, montos por sobre y enlace al hash.
- Pagar: pegar el enlace de cobro o escanear el QR, elegir el sobre, confirmar. Aparece el hash.

### 3. Cobrar (el colegio)

- Monto y concepto.
- QR y enlace para compartir.
- Lista de cobros recibidos: quién pagó, cuánto, concepto, hash.

## Modelo

1% al enviar. Recibir es gratis. Cobrar es gratis.

Quien manda hoy pierde entre 6% y 8% en el giro, y además no puede separar la cuota. Reparte cobra menos, entrega el envío repartido y deja pagar el colegio sin pasar por efectivo.

El comercio no paga por cobrar. Cuando el comercio quiera pagar a su proveedor afuera, ese envío paga el mismo 1%.

La comisión sale como una operación más dentro de la transacción del envío, hacia la cuenta de Reparte. Se ve en el hash.

## Entrevistas

Meta: 6 conversaciones antes del domingo 12:00. Dos preguntas:

> La última vez que llegó plata de afuera, ¿cuánto duró y qué se quedó sin pagar?

> ¿Cómo le pagás hoy al colegio o a la tienda cuando llega esa plata?

A quién escribir hoy:

1. Una familia con alguien en España.
2. Una familia con alguien en Argentina, Chile o Brasil.
3. Quien haya cobrado por Western Union o MoneyGram en el último año.
4. Un padre o una madre que iba a usar esa plata para el colegio.
5. Quien envía, aunque sea por audio de WhatsApp: ¿mandarías una parte directo a la cuota si pudieras?
6. Una tienda o un colegio chico: ¿cobrarías con QR si no te costara nada?

En la slide van citas textuales, con nombre de pila y ciudad. Un número concreto vale más que una estadística.

## Deck de 8 slides

1. **Reparte.** La remesa llega repartida en sobres. Track Pagos y remesas.
2. **Problema.** 200 dólares, 48 horas, la cuota sigue igual. Una familia, un giro, un resto que no alcanzó. El colegio cobra en efectivo.
3. **Evidencia.** Seis citas de las entrevistas.
4. **Solución.** Tres pantallas: Enviar, Billetera, Cobrar. Un envío, tres sobres, un QR para pagar.
5. **Por qué Stellar.** Captura del hash con un pago por sobre y la comisión. Captura del cobro con QR.
6. **Producto.** Las tres pantallas, grabadas.
7. **Modelo.** 1% al enviar. Recibir y cobrar, gratis. El giro de hoy cobra 6% a 8% y no reparte.
8. **Plan de 30 días.** Diez familias y dos colegios, el mismo flujo, hash de testnet ya visible.

## Pitch de 3 minutos

**0:00** María manda 200 dólares desde Madrid todos los meses. Su mamá en La Paz los recibe para la casa, para la matrícula y para los remedios.

**0:25** El jueves la plata de la casa ya se usó. La matrícula sigue igual. El giro no deja separar las cosas, se queda entre 6% y 8%, y el colegio cobra en efectivo en una fila.

**0:50** Leímos esto en seis familias y comercios. Cita textual. Cita textual.

**1:15** Reparte reparte el envío antes de que llegue. 120 al sobre Casa, 60 al sobre Colegio, 20 al sobre Salud. Una sola transacción. La mamá abre la billetera y ve los tres sobres con saldo real.

**1:45** Demo: formulario con sobres, botón, Stellar Expert con las operaciones en el mismo hash. Después el colegio genera un cobro con QR, la mamá lo escanea y paga desde el sobre Colegio. Otro hash.

**2:20** Cobramos 1% a quien envía. Recibir y cobrar es gratis. En 30 días lo probamos con diez familias que ya mandan plata cada mes y dos colegios que quieren dejar el efectivo.

**2:45** Cierre: la remesa deja de ser un solo fajo. Llega en sobres, y el colegio cobra del sobre que le toca.

## Cómo construirlo

Alcance del domingo. Si no está en «Listo» o «Domingo», no se construye.

Stack: Vite + React + `@stellar/stellar-sdk` + `qrcode` para el QR. Sin backend, sin Soroban, sin anchor, sin login. Los contactos viven en `localStorage`.

Red: testnet.

- Horizon: `https://horizon-testnet.stellar.org`
- Passphrase: `Test SDF Network ; September 2015`
- Fondeo: `https://friendbot.stellar.org?addr=G...`

Cuentas de la demo, todas creadas por `scripts/cuentas.mjs`:

| Cuenta | Rol | Clave en `.env` |
|---|---|---|
| emisor | Firma el envío. Emite `USDp`. | `VITE_SENDER_SECRET` |
| casa | Sobre Casa de la familia. | `VITE_CASA_SECRET` |
| colegio_sobre | Sobre Colegio de la familia. | `VITE_COLEGIO_SOBRE_SECRET` |
| salud | Sobre Salud de la familia. | `VITE_SALUD_SECRET` |
| colegio | El comercio que cobra. | `VITE_COLEGIO_PUBLIC` |
| reparte | Recibe el 1%. | `VITE_FEE_PUBLIC` |

Los sobres guardan su clave secreta en `.env` porque en la demo la billetera paga desde ellos. Solo testnet, solo demo.

Flujo técnico:

1. `scripts/cuentas.mjs` crea las seis cuentas, las fondea con Friendbot, abre trustline a `USDp` en todas menos el emisor y escribe el `.env`.
2. **Enviar.** La página calcula un monto por sobre a partir de los porcentajes y la comisión del 1%. Arma una transacción con un `Operation.payment` en `USDp` por sobre más uno hacia la cuenta de Reparte, y `Memo.text("REPARTE " + mensaje)`. Firma con la clave del emisor. Envía a Horizon.
3. **Billetera.** Lee los saldos de cada sobre con `server.loadAccount`. Lee el historial con `server.payments().forAccount(sobre)` filtrando memo `REPARTE`. Para pagar, parsea el enlace `web+stellar:pay`, arma un `payment` desde el sobre elegido con el memo del cobro, firma con la clave del sobre y envía.
4. **Cobrar.** Arma el enlace `web+stellar:pay?destination=G...&amount=60&asset_code=USDp&asset_issuer=G...&memo=Matricula%20marzo` y lo dibuja como QR. Lista los pagos recibidos con `server.payments().forAccount(colegio)`.
5. **Candado (si sobra la tarde).** `Operation.setOptions` en el sobre Colegio: agrega al emisor como firmante y sube el umbral medio a 2. Pagar desde ese sobre pide las dos firmas.

Plan B: si emitir el asset cuesta más de lo esperado, todo sale en XLM y en pantalla se lee como dólares de prueba. Los sobres y los cobros se mantienen igual.

Demo para el bonus: el video muestra el envío repartido y el cobro con QR, y el jurado puede abrir los dos hashes. Esas transacciones son el +10%.

## Estructura de carpetas

```text
reparte/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore                  # node_modules, dist, .env
├── .env.example                # plantilla; se copia a .env y se completa
├── scripts/
│   └── cuentas.mjs             # crea las seis cuentas, las fondea con Friendbot,
│                               # abre trustlines a USDp e imprime el .env listo
└── src/
    ├── main.jsx                # monta <App />
    ├── App.jsx                 # pestañas Enviar · Billetera · Cobrar
    ├── index.css               # estilos de la app
    ├── config.js               # Horizon, passphrase, MEMO, FEE_RATE, USDp,
    │                           # cuentas y sobres desde .env, tasa Bs referencial
    ├── lib/
    │   ├── split.js            # splitEnvelopes: monto por sobre + comisión
    │   ├── stellar.js          # sendSplit, payFromEnvelope, moveBetweenEnvelopes,
    │   │                       # loadBalances, loadHistory
    │   ├── sep7.js             # buildPayLink / parsePayLink (web+stellar:pay)
    │   ├── contacts.js         # libreta en localStorage
    │   ├── format.js           # dólares de prueba, Bs referencial, fechas
    │   └── expert.js           # expertUrl(hash)
    └── components/
        ├── Tabs.jsx            # Enviar · Billetera · Cobrar
        ├── enviar/
        │   ├── Enviar.jsx      # pantalla completa
        │   ├── Contacto.jsx    # elegir o crear a quién se envía
        │   ├── Sobres.jsx      # porcentajes por sobre, suma 100
        │   ├── VistaPrevia.jsx # montos por sobre + comisión
        │   └── Comprobante.jsx # hash, montos, botón compartir
        ├── billetera/
        │   ├── Billetera.jsx   # pantalla completa
        │   ├── SobreCard.jsx   # saldo en USDp y Bs, botones Pagar · Mover
        │   ├── Historial.jsx   # envíos recibidos con mensaje y hash
        │   ├── Pagar.jsx       # pegar/escanear cobro, elegir sobre, confirmar
        │   └── Mover.jsx       # pasar saldo entre sobres
        └── cobrar/
            ├── Cobrar.jsx      # pantalla completa
            ├── NuevoCobro.jsx  # monto, concepto
            ├── QRCobro.jsx     # QR + enlace para compartir
            └── Recibidos.jsx   # pagos recibidos con concepto y hash
```

Orden para trabajarlo el domingo:

1. `scripts/cuentas.mjs` con las seis cuentas y el nuevo `.env`. `src/config.js` con los sobres.
2. `lib/split.js` con sobres y comisión. `lib/stellar.js`: `sendSplit` con N pagos + comisión. Pantalla Enviar con `Sobres.jsx` y `VistaPrevia.jsx`. Primer hash con cuatro operaciones.
3. `lib/stellar.js`: `loadBalances`, `loadHistory`. Pantalla Billetera con `SobreCard.jsx` e `Historial.jsx`. Saldos reales en pantalla.
4. `lib/sep7.js`. Pantalla Cobrar con `NuevoCobro.jsx` y `QRCobro.jsx`. Pantalla Billetera con `Pagar.jsx`. Segundo hash: el cobro pagado desde el sobre Colegio.
5. `lib/contacts.js`, `Contacto.jsx`, `Comprobante.jsx`, `Mover.jsx`, `Recibidos.jsx`, Bs referencial.
6. Grabar el video: envío repartido, billetera con saldos, cobro con QR, dos hashes abiertos.
7. Si sobra la tarde: el candado multisig del sobre Colegio.

## Qué dejar escrito en el video

- El problema en una familia, no en «Bolivia».
- Las citas, aunque sean cortas.
- El hash del envío abierto en Stellar Expert, con un pago por sobre y la comisión a la vista.
- La billetera con los tres sobres y saldo real.
- El QR del colegio, el pago desde el sobre Colegio, el segundo hash.
- El 1% contra el 6% a 8% del giro actual. Cobrar gratis contra el efectivo en fila.

## Después del domingo

- Diez familias reales que ya reciben remesas y dos colegios o tiendas que quieran cobrar con QR.
- Un proveedor de on-ramp regulado para entrar y salir de USDC. Reparte no compra ni vende dólares.
- Envío recurrente: cada mes, el mismo día, el mismo reparto.
- La tienda que cobra en `USDp` paga a su proveedor del exterior desde la misma billetera.
- El sobre Colegio gana un candado por fecha (`timebounds`), además del multisig, para que la cuota no pueda tocarse antes del día de pago.
