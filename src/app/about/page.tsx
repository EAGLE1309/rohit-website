import { TextAnimate } from "@/components/text-animate";
import MaxWidthWrapper from "@/components/layout/max-width-wrapper";
import { Separator } from "@/components/ui/separator";

const AboutPage = () => {
  return (
    <MaxWidthWrapper className="mt-28">
      <div className="w-full flex justify-between gap-y-16 h-full">
        <div className="w-full max-w-[575px] self-end flex flex-col gap-5">
          <TextAnimate className="text-lg font-normal" animation="slideUp" once>
            Rohit Patnala (b. 2004, Houston, TX), known as ro6it, is a multidisciplinary visual artist, creative director, and DJ. His work merges
            visual art, music, and technology to explore themes of memory, identity, and culture.
          </TextAnimate>
          <Separator />
          <TextAnimate className="text-lg font-normal" animation="slideUp" delay={0.5} once>
            He began his creative journey in 2015 by making sports edits on Vine, later transitioning into shooting sports and expanding into broader
            artistic practices. Over time, his work has evolved into a fusion of visual and sonic experiences that reflect his interdisciplinary
            approach.
          </TextAnimate>
          <Separator />
          <TextAnimate className="text-lg font-normal" animation="slideUp" delay={1} once>
            As both an artist and student, Rohit continues to push the boundaries of digital culture and contemporary storytelling, crafting projects
            that blend design, performance, and experimentation.
          </TextAnimate>
        </div>

        <div className="flex flex-col h-full justify-between gap-8">
          <div className="w-full max-w-[575px] max-h-[575px] grid grid-rows-4 grid-cols-2 gap-8">
            <img className="object-cover row-span-3 w-full h-full" src="/about 2.png" alt="" />
            <img className="object-cover w-full h-full row-span-2" src="/about 3.png" alt="" />
            <img className="object-cover w-full h-full row-span-2" src="/about 4.png" alt="" />
          </div>
          <h3 className="font-semibold justify-self-end self-end text-7xl">About</h3>
        </div>
      </div>

      <div className="w-full flex gap-y-16 py-28">
        <TextAnimate className="text-7xl font-semibold" animation="slideUp" by="character" once>
          ropatnala@gmail.com
        </TextAnimate>
      </div>
    </MaxWidthWrapper>
  );
};

export default AboutPage;
