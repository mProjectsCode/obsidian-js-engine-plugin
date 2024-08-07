// const ret = await engine.prompt.button({
//     title: 'Test Prompt',
//     buttons: [
//         {
//             label: 'True',
//             value: true,
//         },
//         {
//             label: 'False',
//             value: false,
//         },
//         {
//             label: 'Cancel',
//             value: undefined,
//         }
//     ]
// });

// const ret = await engine.prompt.yesNo({
//     title: 'Is this a test?',
//     content: 'Are you sure this is a test? Are you sure that your choice is really meaningless?',
// });


const files = engine.query.files((file) => {
    return {
        label: file.name,
        value: file.pat,
    };
});

const ret = await engine.prompt.suggester({
    placeholder: 'Select a file',
    options: files,
});

console.log(ret);