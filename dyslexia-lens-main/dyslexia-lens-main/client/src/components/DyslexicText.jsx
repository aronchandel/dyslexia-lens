import React from 'react';

const DyslexicText = ({ text, analysis }) => {
    if (!text) return null;

    // 1. Split text into paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim() !== "");

    // helper to make the mid-dots (·) subtle
    const processDots = (text) => {
        if (!text) return null;
        const parts = text.split('·');
        return parts.map((chunk, i) => (
            <React.Fragment key={i}>
                {chunk}
                {i < parts.length - 1 && (
                    <span className="text-gray-400 font-bold mx-px">·</span>
                )}
            </React.Fragment>
        ));
    };

    // helper to turn **bold** into <b> and handle definition brackets
    const parseFormatting = (text) => {
        // we need to handle a few things here:
        // 1. Markdown bold (**text**)
        // 2. Definition brackets ((definition))
        // 3. Visual anchors (from analysis.visuals) - though the user code didn't check this, it's good to keep if possible, but let's stick to their requested logic first and maybe merge if needed.
        // the user's requested logic focuses on **bold** and dots. 
        // let's implement their exact logic first, but i'll add the bracket definitions back in because they liked them before (blue text).

        // split by bold marker and brackets to handle both? 
        // the user's code just did split by **. 
        // let's try to combine the previous logic with this new structure.

        // actually, let's stick closer to their provided code for "dyslexictext" but enhance it slightly to support the features we already added (brackets blue) if they exist in the text.
        // result from python now returns markdown headers and brackets.

        const parts = text.split(/(\*\*.*?\*\*|\(.*?\))/g); // split by bold or brackets

        return parts.map((part, i) => {
            // bold
            if (part.startsWith('**') && part.endsWith('**')) {
                const content = part.slice(2, -2);
                return (
                    <span key={i} className="font-bold text-black bg-yellow-100/50 px-1 rounded">
                        {processDots(content)}
                    </span>
                );
            }

            // brackets (definitions)
            if (part.startsWith('(') && part.endsWith(')')) {
                return (
                    <span key={i} className="text-blue-600 font-bold mx-1">
                        {processDots(part)}
                    </span>
                )
            }

            // normal text
            return <span key={i}>{processDots(part)}</span>;
        });
    };

    return (
        <div className="font-opendyslexic text-2xl text-[#1A1A1A] leading-[3rem] tracking-wide space-y-6">
            {paragraphs.map((paragraph, index) => {
                // check for headers
                if (paragraph.trim().startsWith('#')) {
                    return (
                        <h3 key={index} className="text-4xl font-bold text-[#8B6E4E] mt-8 mb-4">
                            {paragraph.replace(/^#+\s*/, '')}
                        </h3>
                    );
                }

                return (
                    <p key={index}>
                        {parseFormatting(paragraph)}
                    </p>
                );
            })}
        </div>
    );
};

export default DyslexicText;
