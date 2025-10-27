/* eslint-disable @next/next/no-img-element */
import { TextAnimate } from "@/components/text-animate";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const AboutPage = () => {
  return (
    <MaxWidthWrapper className="mt-28">
      <div className="w-full flex flex-col-reverse md:flex-row justify-between gap-y-16 h-full">
        <div className="w-full max-w-[575px] self-end flex flex-col gap-5">
          <TextAnimate className="text-md font-normal" animation="slideUp" once>
            I am a visual artist, DJ, and creative director (b. June 30, 2004 - Houston, Texas). I began my creative practice at nine years old making
            sports edits on Vine, which grew into a deep love for culture and cultural movements. Over time this expanded into an affinity for pop
            culture, music, fashion, art, philosophy, and the pursuit of seamlessness.
          </TextAnimate>
          <Separator />
          <TextAnimate className="text-md font-normal" animation="slideUp" delay={0.3} once>
            My work focuses on blending audio and visuals into one experience. I draw inspiration from the fast paced style of Vine edits from 2014 to
            2017 and have since evolved that foundation into my own distinct approach across mediums and musical genres. I am especially drawn to
            loopable videos that feel infinite, where the viewer cannot tell where the cut begins or ends. That subtle continuity and slyness is what
            I love.
          </TextAnimate>
          <Separator />
          <TextAnimate className="text-md font-normal" animation="slideUp" delay={0.5} once>
            I am currently wrapping up my undergraduate studies in Texas while moving between Houston, Dallas, Austin and New York, and I take on
            select projects worldwide.
          </TextAnimate>
        </div>

        <div className="flex flex-col h-full justify-between gap-8">
          {/* <div className="w-full max-w-[575px] max-h-[575px] grid grid-rows-4 grid-cols-2 gap-8">
            <img className="object-cover row-span-3 w-full h-full" src="/about 2.png" alt="" />
            <img className="object-cover w-full h-full row-span-2" src="/about 3.png" alt="" />
            <img className="object-cover w-full h-full row-span-2" src="/about 4.png" alt="" />
          </div> */}
          <img className="w-full md:pl-28 h-full object-cover" src="/about.png" alt="" />
        </div>
      </div>

      <div className="w-full flex gap-y-16 py-28">
        <Tooltip>
          <TooltipTrigger>
            <TextAnimate className="text-5xl md:text-7xl cursor-pointer font-semibold" animation="slideUp" by="character" once>
              ropatnala@gmail.com
            </TextAnimate>
          </TooltipTrigger>
          <TooltipContent>Click to copy</TooltipContent>
        </Tooltip>
      </div>
    </MaxWidthWrapper>
  );
};

export default AboutPage;
