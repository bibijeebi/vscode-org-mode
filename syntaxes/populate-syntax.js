// Script that populate syntax with list of language
const fs = require('fs');

const programmingLanguages = [
    ['asp.vb.net', 'vb'],
    ['c', 'h'],
    ['clojure', 'clj', 'cljs'],
    ['coffee', 'Cakefile', 'coffe.erb'],
    ['cpp', 'c\\+\\+', 'cxx'],
    ['cs', 'csharp', 'c#'],
    ['css.less', 'less'],
    ['css.scss', 'scss'],
    ['css'],
    ['dart'],
    ['diff', 'patch', 'rej'],
    ['dockerfile', 'Dockerfile'],
    ['dosbatch', 'batch', 'bat'],
    ['elixir'],
    ['erlang', 'erl', 'hrl'],
    ['fs', 'fsharp', 'f#'],
    ['go', 'golang'],
    ['groovy', 'gvy'],
    ['ini', 'conf', 'properties'],
    ['java'],
    ['js.regexp', 'regexp'],
    ['js', 'javascript', 'mjs', 'es6', 'jsx'],
    ['lisp', 'emacs-lisp', 'common-lisp'],
    ['lua'],
    ['makefile', 'Malefile'],
    ['nim'],
    ['nix'],
    ['objc', 'objectivec', 'objective-c', 'mm', 'm', 'obj-c'],
    ['ocaml'],
    ['perl.6', 'perl6', 'p6', 'pl6', 'pm6', 'nqp'],
    ['perl', 'pl', 'pm'],
    ['php', 'php3', 'php4', 'php5', 'phpt', 'phtml', 'aw', 'ctp'],
    ['pug', 'jade'],
    ['python', 'py', 'py3', 'rpy', 'pyw', 'cpy', 'SConstruct', 'Sconstruct', 'sconstruct', 'SConscript', 'gyp', 'gypi'],
    ['r', 'R', 's', 'S', 'Rprofile'],
    ['regexp.python', 're'],
    ['ruby', 'rb', 'rbx', 'rjs', 'Rakefile', 'rake', 'cgi', 'fcgi', 'gemspec', 'irbrc', 'Capfile', 'ru', 'prawn', 'Cheffile', 'Gemfile', 'Guardfile', 'Hobofile', 'Vagrantfile', 'Appraisals', 'Rantfile', 'Berksfile', 'Berksfile.lock', 'Thorfile', 'Puppetfile'],
    ['rust', 'rs'],
    ['scala', 'sbt'],
    ['shell', 'sh', 'bash', 'zsh', 'bashrc', 'bash_profile'],
    ['sql', 'ddl', 'dml'],
    ['ts', 'typescript'],
    ['tsx'],
    ['zig'],
];
// List of language retrieve from https://github.com/Microsoft/vscode/blob/master/extensions/markdown-basics/syntaxes/markdown.tmLanguage.json
// Preproced by the following jq command: jq '.repository.block.repository|to_entries[]|{block: .key, names: .value.begin, source: .value.patterns[0].patterns[0].include?}'

const markupLanguages = [
    ['source.json', 'json'],
    ['source.org', 'orgmode', 'org'],
    ['source.yaml', 'yaml', 'yml'],
    ['text.git-commit', 'COMMIT_EDITMSG', 'MERGE_MSG'],
    ['text.git-rebase', 'git-rebase-todo'],
    ['text.html.basic', 'html', 'htm', 'shtml', 'xhtml', 'inc', 'tmpl', 'tpl'],
    ['text.html.markdown', 'markdown', 'md'],
    ['text.tex.latex', 'latex', 'tex'],
    ['text.xml.xsl', 'xsl', 'xslt'],
    ['text.xml', 'xml', 'xsd', 'tld', 'jsp', 'pt', 'cpt', 'dtml', 'rss', 'opml'],
];

const generateDefinitionForProgrammingLanguage = language =>
    generateBlockSourceDefinition(language[0], language.join('|'), `source.${language[0]}`);

const generateDefinitionForMarkupLanguage = language =>
    generateBlockSourceDefinition(language[1], language.slice(1).join('|'), language[0]);

const generateBlockSourceDefinition = (scope, match, sourceLanguage) => {
    var basePattern = {
        name: `meta.block.source.${scope}.org`,
        begin: `(?i)(?:^|\\G)(?:\\s*)(#\\+BEGIN_SRC)\\s+(${match})\\b\\s*(.*)$`,
        end: '(?i)(?:^|\\G)(?:\\s*)(#\\+END_SRC)\\s*$',
        beginCaptures: {
            '1': {
                name: 'keyword.control.block.org'
            },
            '2': {
                name: 'constant.other.language.org'
            },
            '3': {
                name: 'string.other.header-args.org'
            }
        },
        endCaptures: {
            '1': {
                name: 'keyword.control.block.org'
            }
        },
        patterns: [
            {
                begin: '(^|\\G)(\\s*)(.*)',
                while: '(?i)(^|\\G)(?!\\s*#\\+END_SRC\\s*)',
                contentName: `meta.embedded.block.${scope}`
            }
        ]
    }
    if (sourceLanguage)
        basePattern.patterns[0].patterns = [
            {
                include: sourceLanguage
            }
        ];
    return basePattern;
};

const generateGrammar = () => {
    const grammarTemplate = fs.readFileSync(`${__dirname}/org.tmLanguage.template.json`);
    const jsonGrammar = JSON.parse(grammarTemplate);
    const languageDefinitions = programmingLanguages.map(generateDefinitionForProgrammingLanguage)
        .concat(markupLanguages.map(generateDefinitionForMarkupLanguage));
    languageDefinitions.push(generateBlockSourceDefinition('unknown', '\\w+', null))
    jsonGrammar.repository['src-blocks'].patterns = languageDefinitions;
    fs.writeFileSync(`${__dirname}/org.tmLanguage.json`, JSON.stringify(jsonGrammar, null, 4));
};

if (!module.parent) {
    console.log('Regenerating the grammar')
    generateGrammar();
}