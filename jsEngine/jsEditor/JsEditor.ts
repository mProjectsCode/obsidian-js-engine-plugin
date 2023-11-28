import { TextFileView } from 'obsidian';
import { EditorView, placeholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { autocompletion } from '@codemirror/autocomplete';
import { lintGutter } from '@codemirror/lint';
import { bracketMatching, codeFolding } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';

export const JS_EDITOR_VIEW_TYPE = 'js-engine-js-editor';

export class JsEditor extends TextFileView {
	editor?: EditorView;

	public clear(): void {}

	public getViewData(): string {
		return this.editor?.state.doc.toString() ?? '';
	}

	public getViewType(): string {
		return JS_EDITOR_VIEW_TYPE;
	}

	public setViewData(data: string, _clear: boolean): void {
		this.editor = new EditorView({
			state: EditorState.create({
				doc: data,
				extensions: [autocompletion(), lintGutter(), codeFolding(), bracketMatching(), javascript(), placeholder('Enter code here...')],
			}),
			parent: this.contentEl,
		});

		// this.editor.dispatch();
	}
}
