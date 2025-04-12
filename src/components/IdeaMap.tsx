const newNodes = prevNodes.map((node) => {
    if (node.id === cardData.id) {
        return {
            ...node,
            data: {
                ...node.data,
                title: cardData.title,
                content: cardData.content ?? '',
            },
        };
    }
    return node;
}); 