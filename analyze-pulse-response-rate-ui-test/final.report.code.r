# r-analysis code for pulse data

require("corrplot")
require('plyr')
require('MASS')

require("ggplot2")
require("scales")

#### utilites

Dsquared <- function(model, adjust = FALSE) {
  # src:  http://modtools.wordpress.com/2013/08/14/dsquared/
  # version 1.1 (13 Aug 2013)
  # calculates the explained deviance of a GLM
  # model: a model object of class "glm"
  # adjust: logical, whether or not to use the adjusted deviance taking into acount the nr of observations and parameters (Weisberg 1980; Guisan & Zimmermann 2000)
  d2 <- (model$null.deviance - model$deviance) / model$null.deviance
  if (adjust) {
    n <- length(model$fitted.values)
    p <- length(model$coefficients)
    d2 <- 1 - ((n - 1) / (n - p)) * (1 - d2)
  }
  return(d2)
}  # end Dsquared function


# http://www.cookbook-r.com/Manipulating_data/Summarizing_data/
## Summarizes data.
## Gives count, mean, standard deviation, standard error of the mean, and confidence interval (default 95%).
##   data: a data frame.
##   measurevar: the name of a column that contains the variable to be summariezed
##   groupvars: a vector containing names of columns that contain grouping variables
##   na.rm: a boolean that indicates whether to ignore NA's
##   conf.interval: the percent range of the confidence interval (default is 95%)
summarySE <- function(data=NULL, measurevar, groupvars=NULL, na.rm=FALSE,
                      conf.interval=.95, .drop=TRUE) {
    require(plyr)

    # New version of length which can handle NA's: if na.rm==T, don't count them
    length2 <- function (x, na.rm=FALSE) {
        if (na.rm) sum(!is.na(x))
        else       length(x)
    }

    # This does the summary. For each group's data frame, return a vector with
    # N, mean, and sd
    datac <- ddply(data, groupvars, .drop=.drop,
      .fun = function(xx, col) {
        c(N    = length2(xx[[col]], na.rm=na.rm),
          mean = mean   (xx[[col]], na.rm=na.rm),
          sd   = sd     (xx[[col]], na.rm=na.rm)
        )
      },
      measurevar
    )

    # Rename the "mean" column
    m <- datac$mean
    datac <- rename(datac, c("mean" = measurevar))

    datac$se <- datac$sd / sqrt(datac$N)  # Calculate standard error of the mean

    # Confidence interval multiplier for standard error
    # Calculate t-statistic for confidence interval:
    # e.g., if conf.interval is .95, use .975 (above/below), and use df=N-1
    ciMult <- qt(conf.interval/2 + .5, datac$N-1)
    datac$ci <- datac$se * ciMult

    # don't simplify!  couldn't get t(c(-1,1)) * to do the right thing. gave up.
    #datac[,c('lower','upper')] <- prop + 2*(datac$ci) %*% t(c(-1,1))
    datac$lower = m + 2* -1 * (datac$ci)
    datac$upper = m + 2 * 1 * (datac$ci)

    datac$conf <- conf.interval
    return(datac)
}

# assumes 1/0
byGroupProportion <-function(data=NULL, measurevar, groupvars=NULL, na.rm=FALSE,
                      conf.interval=.95, .drop=TRUE) {

    # New version of length which can handle NA's: if na.rm==T, don't count them
    length2 <- function (x, na.rm=FALSE) {
        if (na.rm) sum(!is.na(x))
        else       length(x)
    }

    datac <- ddply(data, groupvars, .drop=.drop,
      .fun = function(xx, col) {
        c(N    = length2(xx[[col]], na.rm=na.rm),
          prop = mean   (xx[[col]], na.rm=na.rm)
        )
      },
      measurevar
    )

    prop <- datac$prop
    datac$sd <- sqrt(datac$prop * (1-datac$prop))
    datac$se <- sqrt(1/datac$N) * datac$sd

    #L <- conf.interval/2 + .5
    #R <- 1 - L
    #
    #names(ends) <- paste('q',100*c(.025,.975),sep='')
    ciMult <- qt(conf.interval/2 + .5, datac$N-1)
    datac$ci <- datac$se * ciMult
    ##
    #ends <- datac
    #endnames <- paste('q',100*c(.025,.975),sep='')
    #ends <-
    datac <- rename(datac, c("prop" = measurevar))

    # don't simplify!  couldn't get t(c(-1,1)) * to do the right thing. gave up.
    #datac[,c('lower','upper')] <- prop + 2*(datac$ci) %*% t(c(-1,1))
    datac$lower = prop + 2* -1 * (datac$ci)
    datac$upper = prop + 2 * 1 * (datac$ci)

    datac$conf <- conf.interval
    #names(ends) <- paste('q',100*c(.025,.975),sep='')

    #pbar + c(−E, E)
    return(datac)
}

ci_plot.discrete <- function (frame, catvar, valvar, title, flip=T,
   transform=identity,
   lower.limit, upper.limit) {
  ## frame needs:
  ## - catvar, on y
  ## - valvar on x
  ## - cols 'upper', 'lower'
  ##
  ## flip
  ##
  ## nits:  vals get transformed!  no theming easiness

  # set up labels, ugh.
  f <- frame[,] ## copy ugh.

  f$v.v <- transform(frame[,valvar])
  f$v.lower <- transform(frame$lower)
  f$v.upper <- transform(frame$upper)

  p <- ggplot(f,aes_string(x=catvar,y=valvar,color=catvar)) +
    geom_linerange(aes_string(x=catvar, ymin="lower", ymax="upper")) +
    #scale_y_continuous(labels = transform) +     # y as percent
    geom_point(col='white',size=2) +
    #geom_text(aes( label=100*round(rated,4)), show_guide=F, hjust=.5, vjust=-1, size=4) +  # main
    #geom_text(aes( y = lower, label=100*round(lower,4)), show_guide=F, hjust=0, vjust=2, size=3) +  # lower
    #geom_text(aes( y = upper, label=100*round(upper,4)), show_guide=F, hjust=1, vjust=2, size=3) + # upper


    ## TODO, these don't survive non-flip very well.  siwtch hjust, vjust
    geom_text(aes( label=v.v), show_guide=F, hjust=.5, vjust=-1, size=6) +  # main
    geom_text(aes( y = lower, label=v.lower), show_guide=F, hjust=0, vjust=2, size=4) +  # lower
    geom_text(aes( y = upper, label=v.upper), show_guide=F, hjust=1, vjust=2, size=4) + # upper

    theme(legend.position="none") +
    theme(axis.text.y  = element_text(angle=0, size=16),
      axis.text.x  = element_text(angle=0, size=16) ) +
    xlab(label="") +
    ylab(label="") +
    ggtitle(title)

  # this might not be right after coord_flip!
  # http://www.r-bloggers.com/setting-axis-limits-on-ggplot-charts/
  upperaxis <- ggplot_build(p)$panel$ranges[[1]]$y.range[2]
  loweraxis <- ggplot_build(p)$panel$ranges[[1]]$y.range[1]
  print(c(loweraxis, upperaxis))
  p <- p + scale_y_continuous(labels = transform, limits=c(
    if (missing(lower.limit)) loweraxis else lower.limit,
    if (missing(upper.limit)) upperaxis else upper.limit
  ))

  print(ggplot_build(p)$panel$ranges[[1]]$y.range)

  if (flip) { message("flipping!"); p <- p + coord_flip() }

  return (p)
}



significance.stars <- function(pv) {
  Signif <- symnum(pv, corr = FALSE, na = FALSE,
  cutpoints = c(0, 0.001, 0.01, 0.05, 0.1, 1),
  symbols = c("***", "**", "*", ".", " "))
  return (Signif)
}

model_super_summary <- function(model, coef_trans=identity, ci_obj, digits) {
  # model: a glm, lm or whatnot.
  # coef_trans: how to transform the coeffs into something human readable.
  #   (exp for binomial regression, for example)
  # ci_obj:  calculating 'confint' can be expensive.  pass in a confint obj
  #    if you have one, to speed up call.
  # digits: for rounding.
  #
  # if we have a ci_obj, use it!
  if (missing(ci_obj)) {
    ci_obj <- confint(model)
  }
  # size for n=1
  if (is.null(dim(ci_obj))) {
    ci_obj <- t(data.frame(ci_obj))
  }
  ci_obj <- coef_trans(ci_obj)
  s <- coef(summary(model))
  a <- data.frame(b=coef_trans(s[,1]))
  sig <- s[,4]
  #print(sig)
  out <- cbind(
    a,
    ci_obj,
    s)
  if (!missing(digits)) {
    out <- round(out, digits)
  }
  return (cbind(
    out,
    stars=format(as.vector(significance.stars(sig)))
    )
  )
}

subset.analyzeable_rating <- function () {
  subset(pulse,!grepl('^noti',widget) & rated);
}


#### setup
pulse <- read.csv("pulse.experiment.data.csv")
pulse$firstlink[pulse$nlinks>0 & pulse$firstlink == ""]  <- "link-feedback"

#### goals
## is triggering related to things?  Should not be!
# - glm

## is response | triggering related things... should be for widget, not question
#  - model is poor
#  - stepwise for vars

## is rating related to things... we expect so.
#  - model
#  - model fit

# interesting output variables


# no interesting correlations that preclude regress, EXCEPT profile age, phase timing.

corrplot(cor(pulse[,sapply(pulse,function(x){is.numeric(x)|is.logical(x)})]))
# this needs a 'wait' for some reason.  TODO!
png('plots/pulse.analysis.variable.corrleations.png')
dev.off()

vars <- c('rated', 'crashed', 'abp', 'profileage', 'release', 'rejected', 'search_cat', 'context', 'widget', 'question')
summary(pulse[,vars])


# triggering... does everyone see the trigger?  # expensive operation!

trigger.data <- ddply(pulse[,c('f.triggered','context','person')], c("person"), summarise,
  max.trigger = max(f.triggered),
  attempts = length(f.triggered),
  context = context[1]
)


#### flowstages

flow.stages <- (function() {
  a <- rbind(
    start=c(0,nrow(trigger.data)),
    trigger.ui=table(trigger.data$max.trigger != 0),
    rate=table(pulse$rated),
    engage=table(pulse$f.engage>0),
    refuse=table(pulse$rejected)
  );

  a <- data.frame(a)
  a$pct <- a$TRUE. / a$TRUE.[1]
  # cumprod
  a$ofprev <- c(1,c(a$TRUE.[-1]) / rev(rev(a$TRUE.)[-1]))
  a <- rename(a, c("TRUE." = "n.stage"))
  a <- a[,-1]
  a['refuse','ofprev'] <- a['refuse','n.stage']/a['trigger.ui','n.stage']
  return (a)
})()


flow.stages

## At most one flow per person.  always take last.
final.flow.for.people.rowids <- (
  function () {
    # 0002c77d-3cb7-455f-af66-15ceb24ca55d
    # sort by person, antistarting. (last first!)
    d <- data.frame(i=seq(nrow(pulse)),p=pulse$person)[
      order(pulse$person,-pulse$f.started),]
    rowids <- d[!duplicated(d$p),'i']
    if (any(duplicated(pulse$person[rowids]))) {
      stop("dupication still exists")
    }
    # prove unique.
    return (rowids)
  }
)()


# proportion of flows ever triggered.
prop.table(table(trigger.data$max.trigger > 0))
prop.table(table(trigger.data$context, trigger.data$max.trigger > 0),1)



# mean attempts to trigger
summarySE(trigger.data, 'attempts', 'context')

p1 <- ci_plot.discrete(summarySE(trigger.data, 'attempts', 'context'), 'context', 'attempts', "Context:  Newtab Needs More Attempts To Trigger", transform=function(x){round(x,1)}, flip=T, lower.limit=0) ; p1
ggsave("plots/contexts.newtab.needs.more.attempts.to.trigger.png", scale=2, width=6, height=5)

# score by context
summarySE(subset.analyzeable_rating(), 'rating', 'context')

p1 <- ci_plot.discrete(summarySE(subset.analyzeable_rating(), 'rating', 'context'), 'context', 'rating', "Context:  No Difference In Rating",
    transform=function(x){round(x,1)}, flip=T, lower.limit=0, upper.limit=5) ; p1
ggsave("plots/contexts.no.difference.in.rating.png", scale=2, width=6, height=5)


## rated, of triggered

props.rated <- byGroupProportion(subset(pulse, pulse$f.triggered>0), 'rated', 'widget')
props.rated <- props.rated[order(-props.rated$rated),]

# put the worst first
pulse$widget <- factor(pulse$widget, levels=rev(props.rated$widget))


#
widget.summary <- ddply(subset(pulse, f.triggered >0), c('widget'), summarize,
  N = length(person),
  rated.N = sum(rated),
  rating.valid.N = sum(rating > 0 & rating <6),
  rated.pct = sum(rated)/N,
  score = sum(rating[rating > 0 & rating <6])/rating.valid.N,
  rejected.pct = sum(rejected)/N,
  engaged.pct = sum(f.engage >0)/rated.N
)


p.1 <- ci_plot.discrete(props.rated, 'widget', 'rated', "Bottom Notification Rated Most Often",
 transform=percent, lower.limit=0)
p.1

ggsave("plots/widget.bottom.notification.highest.rate.png",scale=2, width=6, height=5)


## did they rate!
model.rated.interceptonly <- glm(data = subset(pulse, f.triggered > 0), rated ~ 1)




model.rated <- glm(data = subset(pulse, f.triggered > 0),
  rated ~
  crashed + abp +
  # profile1month + profile1year +
  profileage + release + search_cat +
    #search_weird +  # yes, this is corr'd, will be used in stepwise
  context + widget + question, family='binomial')

model.rated.stepwise = stepAIC(model.rated, direction='both')

model.rated.interactions <- glm(data = subset(pulse, f.triggered > 0),
                                rated ~
                                  (crashed + abp +
                                     # profile1month + profile1year +
                                     profileage + release + search_cat +
                                     search_weird +  # yes, this is corr'd, will be used in stepwise
                                     context + widget + question) ^2
                                , family='binomial')


# fit isn't very good.

anova(
  model.rated.interceptonly,
  model.rated.stepwise,
  model.rated,
  model.rated.interactions,  # this beats intercept only.
  test='Chisq'
);

model.rated.stepwise.ci <- confint(model.rated.stepwise)
#
Dsquared(model.rated.stepwise)
Dsquared(model.rated.interactions)

model_super_summary(model.rated.stepwise, exp, model.rated.stepwise.ci)

### rating value!

# notification bar is weirdly low.
# we believe it's b/c the 'no thanks' button is to right, leading to 5s depression.
#
# for ratings model, should exclude all notification bar (sad!) b/c
# score there is "5-deficient"
with(subset(pulse,rated & rating>0), 100*round(prop.table(table(widget, rating),1),2))
with(subset(pulse,rated & rating>0), 100*round(prop.table(table(question, rating),1),2))



## ratings omit all 'notificaton bar' ratings.  Not sure if this is right or not.
model.rating.interceptonly <- glm(data = subset.analyzeable_rating(),
  rating ~ 1,
  family='gaussian')

model.rating <- glm(data = subset.analyzeable_rating(),
  rating ~
  crashed + abp +
  #profile1month + profile1year +
  profileage + release + search_cat +
  context + widget + question, family='gaussian')

model.rating.interactions <- glm(data = subset.analyzeable_rating(),
  rating ~
  (crashed + abp +
  # profile1month + profile1year
  + profileage + release + search_cat +
  context + widget + question)^2, family='gaussian')

model.rating.stepwise = stepAIC(model.rating, direction='both')

anova(
  model.rating.interceptonly,
  model.rating.stepwise,
  model.rating,
  model.rating.interactions,  # this beats intercept only.
  test='Chisq'
);


model.rating.stepwise.ci <- confint(model.rating.stepwise)
#
Dsquared(model.rating.stepwise)
Dsquared(model.rating.interactions)

model_super_summary(model.rating.stepwise, exp, model.rating.stepwise.ci)



# score by question
summarySE(subset(subset.analyzeable_rating(),rated & rating>0), 'rating', "question")
summarySE(subset(subset.analyzeable_rating(),rated & rating>0), 'rating', NULL)


p1 <- ci_plot.discrete(summarySE(subset(subset.analyzeable_rating(),rated), 'rating', "question"),
                       'question', 'rating', "Question:  No Difference In Rating",
                       transform=function(x){round(x,1)}, flip=T, lower.limit=0, upper.limit=5) ; p1
ggsave("plots/question.satisfied.rating.worse.png", scale=2, width=6, height=5)

model_super_summary(
  glm(data=subset(subset.analyzeable_rating(),rated), rating~question, family='gaussian')
)


## engagment

mean(subset(pulse, rated)$f.engage > 0)
#22%

engagements<- (function () {
  l <- subset(pulse, nlinks>0)
  l$firstlink <- factor(droplevels(l$firstlink))
  #prop.table(table(l$firstlink))
  tt <- table(l$firstlink)
  tl <- prop.table(tt)
  names(tl) <- sub('link-','',names(tl))
  s<-c('fix','love')[(names(tl)=="votefirefox")+1]
  names(s) <- names(tl)
  s['feedback'] <- 'tell'

  d <- data.frame(row.names=names(tl),
    freq=as.vector(tl),
    n=as.vector(tt),
    etype=s
  )
  d$freq <- percent(d$freq)
  d<- d[order(d$etype, -d$n),]
  d$oftype=ddply(d,"etype",summarize,oftype=percent(n/sum(n)))$oftype

  return (d)
})()


# one person responsible for most of it!
table(pulse$nlinks)

model.engage.interactions <- glm(data = subset(pulse, rated),
  f.engage > 0
  ~
  (crashed + abp + search_weird +
  context + widget + question ) ^2,
  family='binomial'
)

model.engage <- glm(data = subset(pulse, rated),
  f.engage > 0
  ~
  crashed + abp + search_weird +
  context + widget + question  +
  rating,
  family='binomial'
)


model.engage.stepwise = stepAIC(model.engage, direction='both')

# puzzling results here!
model_super_summary(model.engage.stepwise,exp)

summary(glm(data=subset.analyzeable_rating(), nlinks>0 ~ rating, family="binomial"))


model.positive.engage <- glm(
  data=subset(pulse,nlinks>0 & firstlink != 'link-feedback'),
  firstlink == 'link-votefirefox' ~
    crashed + abp + search_weird +
    profile1year + widget + question,
  family='binomial')

# positive / negative? engage.
model_super_summary(model.positive.engage, exp, digits=2)
Dsquared(model.positive.engage)
