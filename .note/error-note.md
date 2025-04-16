# Route used params.id. params should be awaited before using its properties

    @https://nextjs.org/docs/messages/sync-dynamic-apis 보여주고, Next 15 형식의 비동기 호출하기. 

    ~~~
    Error: Route "/api/cards/[id]" used params.id. params should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at GET (src/app/api/cards/[id]/route.ts:42:30)
    40 | ) {
    41 |   try {

    42 |     const id = context.params.id;
    |                              ^
    43 |     console.log(카드 상세 조회 요청: ID=${id});
    44 |
    45 |     // 카드 조회 (태그 정보 포함)
    ~~~

